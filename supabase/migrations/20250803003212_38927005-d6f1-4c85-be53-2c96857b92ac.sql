-- Função para criar usuário de teste (executar com privilégios de serviço)
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Gerar um UUID para o usuário
    user_uuid := gen_random_uuid();
    
    -- Inserir diretamente na tabela auth.users com estrutura correta
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        last_sign_in_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change_token_current,
        email_change_confirm_status
    ) VALUES (
        user_uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'teste@fittracker.com',
        crypt('123456', gen_salt('bf')),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        now(),
        now(),
        now(),
        '',
        '',
        '',
        '',
        0
    );
    
    -- Inserir o perfil automaticamente
    INSERT INTO public.profiles (user_id, username)
    VALUES (user_uuid, 'usuario_teste');
    
END $$;