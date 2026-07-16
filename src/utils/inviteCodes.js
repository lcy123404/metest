// 邀请码系统 — Supabase 增删查
import { supabase } from './supabase';

const TABLE = 'invite_codes';

// 确保表存在（首次运行时创建）
export async function ensureTable() {
  try {
    await supabase.from(TABLE).select('id').limit(1);
    return true;
  } catch {
    console.warn('invite_codes 表不存在，请在 Supabase 中创建');
    return false;
  }
}

// 验证邀请码是否有效
export async function validateCode(code) {
  if (!code || !code.trim()) return { valid: false, error: '请输入邀请码' };

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('code', code.trim())
    .eq('is_active', true)
    .single();

  if (error || !data) return { valid: false, error: '邀请码无效或已失效' };
  if (data.max_uses > 0 && data.used_count >= data.max_uses) {
    return { valid: false, error: '该邀请码已被使用完' };
  }

  return { valid: true, data };
}

// 标记邀请码为已使用
export async function consumeCode(id, userEmail) {
  const { error } = await supabase
    .from(TABLE)
    .update({
      used_count: supabase.raw ? undefined : undefined,
    })
    .eq('id', id);

  // 使用 RPC 方式增加计数
  const { data, error: rpcError } = await supabase.rpc('consume_invite_code', {
    code_id: id,
    user_identity: userEmail,
  });

  if (rpcError) {
    // RPC 可能不存在，直接 update
    const { data: current } = await supabase.from(TABLE).select('used_count').eq('id', id).single();
    const newCount = (current?.used_count || 0) + 1;
    await supabase.from(TABLE).update({ used_count: newCount }).eq('id', id);
  }
}

// 管理员：生成邀请码
export async function generateCodes(count = 1, maxUses = 1, createdBy = 'admin') {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // 生成 8 位随机码（大写字母+数字，排除易混淆字符）
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const { error } = await supabase.from(TABLE).insert({
      code,
      max_uses: maxUses,
      created_by: createdBy,
    });

    if (!error) codes.push(code);
  }
  return codes;
}

// 管理员：获取所有邀请码
export async function listCodes() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// 管理员：停用/启用邀请码
export async function toggleCode(id, isActive) {
  const { error } = await supabase.from(TABLE).update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

// 管理员：删除邀请码
export async function deleteCode(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
