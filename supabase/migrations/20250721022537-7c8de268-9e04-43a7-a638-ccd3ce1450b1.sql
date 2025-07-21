-- Criar função para verificar se um usuário precisa trocar a senha
CREATE OR REPLACE FUNCTION public.user_needs_password_change(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    needs_change BOOLEAN := FALSE;
BEGIN
    SELECT (auth.users.raw_user_meta_data ->> 'needs_password_change')::boolean
    INTO needs_change
    FROM auth.users
    WHERE auth.users.id = user_id;
    
    RETURN COALESCE(needs_change, FALSE);
END;
$$;

-- Função para marcar que usuário não precisa mais trocar senha
CREATE OR REPLACE FUNCTION public.mark_password_changed(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users 
    SET raw_user_meta_data = raw_user_meta_data || '{"needs_password_change": false}'::jsonb
    WHERE id = user_id;
END;
$$;