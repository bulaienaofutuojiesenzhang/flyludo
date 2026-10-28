/**
 * AI 直连编排：扣钻/记账走 tongcheng，能力调用走 z7 Open API
 */
import Http from './HttpPost';
import { z7Post, pickTaskId } from './z7OpenApi';

/**
 * 扣钻拿 ticket + externalUserId
 */
export async function billCharge(category, type) {
  const res = await Http('post', '/ai-proxy/bill/charge', { category, type });
  if (Number(res?.code) !== 200) {
    const err = new Error(res?.message || res?.msg || '扣钻失败');
    err.code = res?.code;
    err.res = res;
    throw err;
  }
  return res.data || {};
}

export async function billBind(ticket, taskId) {
  const res = await Http('post', '/ai-proxy/bill/bind', { ticket, taskId });
  return res;
}

export async function billCancel(ticket) {
  try {
    return await Http('post', '/ai-proxy/bill/cancel', { ticket });
  } catch (_) {
    return null;
  }
}

export async function billFinish(taskId, status) {
  try {
    return await Http('post', '/ai-proxy/bill/finish', { taskId, status });
  } catch (_) {
    return null;
  }
}

/**
 * 提交 AI 能力（场景动图/视频/脱衣/换衣）
 */
export async function submitAiDirect({ ability, sourceUrl, sceneName, method, externalUserId }) {
  const charge = await billCharge('ai', ability);
  const ticket = charge.ticket;
  const uid = charge.externalUserId || externalUserId;
  try {
    const z7Res = await z7Post('/ai/submit', {
      ability,
      sourceUrl,
      sceneName,
      method,
      skipCharge: true,
      externalUserId: uid,
    });
    if (Number(z7Res?.code) !== 200) {
      await billCancel(ticket);
      const err = new Error(z7Res?.message || 'AI 提交失败');
      err.code = z7Res?.code;
      err.res = z7Res;
      throw err;
    }
    const taskId = pickTaskId(z7Res.data);
    if (!taskId) {
      await billCancel(ticket);
      throw new Error('AI 提交异常：未返回任务号');
    }
    await billBind(ticket, taskId);
    return {
      taskId,
      cost: charge.cost,
      yuanbao: charge.yuanbao,
      raw: z7Res.data,
    };
  } catch (e) {
    if (ticket && !e?.__bound) {
      await billCancel(ticket);
    }
    throw e;
  }
}

/**
 * 提交换脸
 */
export async function submitFaceswapDirect({ type, sourceUrl, targetUrl, externalUserId }) {
  const charge = await billCharge('faceswap', type);
  const ticket = charge.ticket;
  const uid = charge.externalUserId || externalUserId;
  try {
    const z7Res = await z7Post('/faceswap/submit', {
      type,
      sourceUrl,
      targetUrl,
      skipCharge: true,
      externalUserId: uid,
    });
    if (Number(z7Res?.code) !== 200) {
      await billCancel(ticket);
      const err = new Error(z7Res?.message || '换脸提交失败');
      err.code = z7Res?.code;
      err.res = z7Res;
      throw err;
    }
    const taskId = pickTaskId(z7Res.data);
    if (!taskId) {
      await billCancel(ticket);
      throw new Error('换脸提交异常：未返回任务号');
    }
    await billBind(ticket, taskId);
    return {
      taskId,
      cost: charge.cost,
      yuanbao: charge.yuanbao,
      raw: z7Res.data,
    };
  } catch (e) {
    if (ticket) await billCancel(ticket);
    throw e;
  }
}

export async function pollAiTask(taskId) {
  return z7Post('/ai/task', { task_id: taskId });
}

export async function pollFaceswapTask(taskId) {
  return z7Post('/faceswap/task', { task_id: taskId });
}

export async function fetchScenes() {
  return z7Post('/ai/scenes', {});
}

export async function fetchClothesStyles() {
  return z7Post('/ai/clothesStyles', {});
}
