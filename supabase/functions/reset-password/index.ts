import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Função para gerar senha aleatória
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

interface ResetPasswordRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ResetPasswordRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Criar cliente Supabase com service role key para operações admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verificar se o usuário existe
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("Erro ao buscar usuários:", userError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      // Por segurança, retornamos sucesso mesmo se o usuário não existir
      return new Response(
        JSON.stringify({ message: "Se o email existir, uma senha temporária foi enviada." }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Gerar senha temporária
    const temporaryPassword = generateTemporaryPassword();

    // Atualizar a senha do usuário
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: temporaryPassword,
        user_metadata: {
          ...user.user_metadata,
          needs_password_change: true, // Flag para forçar alteração de senha
        }
      }
    );

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar senha temporária" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Enviar email com a senha temporária
    const emailResponse = await resend.emails.send({
      from: "MyFitTracker <onboarding@resend.dev>",
      to: [email],
      subject: "Senha Temporária - MyFitTracker",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333; text-align: center;">Senha Temporária</h1>
          
          <p>Olá,</p>
          
          <p>Você solicitou uma senha temporária para sua conta no MyFitTracker.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0; text-align: center;">Sua senha temporária:</h2>
            <div style="font-size: 24px; font-weight: bold; text-align: center; color: #2563eb; margin: 10px 0; font-family: monospace; letter-spacing: 2px;">
              ${temporaryPassword}
            </div>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Importante:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #92400e;">
              <li>Esta é uma senha temporária</li>
              <li>Você será obrigado a alterar sua senha no primeiro login</li>
              <li>Use esta senha apenas para fazer login e definir uma nova senha</li>
              <li>Por segurança, escolha uma senha forte e única</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get("SUPABASE_URL")?.replace("/rest/v1", "") || "https://sua-app.com"}/auth" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Fazer Login
            </a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            Se você não solicitou esta senha temporária, pode ignorar este email com segurança.
          </p>
          
          <p style="text-align: center; color: #666; font-size: 12px;">
            MyFitTracker - Seu companheiro de fitness
          </p>
        </div>
      `,
    });

    console.log("Email enviado:", emailResponse);

    return new Response(
      JSON.stringify({ 
        message: "Senha temporária enviada para seu email. Verifique sua caixa de entrada."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro na função reset-password:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);