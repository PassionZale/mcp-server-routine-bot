import { TapdUserTask } from "@/tools/tapd/types.js";

type TaskData = Array<{ Task: TapdUserTask }>;

// 状态映射
const STATUS_MAP = {
  open: "未开始",
  progressing: "进行中",
  done: "已完成",
} as const;

// 统计数据接口
interface TaskStatistics {
  owner: string;
  total: number;
  completed: number;
  progressing: number;
  notStarted: number;
}

// 分组结果接口
interface GroupedTasksResult {
  statistics: TaskStatistics[];
  summary: {
    totalOwners: number;
    totalTasks: number;
    totalCompleted: number;
    totalProgressing: number;
    totalNotStarted: number;
  };
  formattedOutput: string;
}

/**
 * 按 owner 分组任务并生成格式化输出
 * @param taskData 任务数据
 * @returns 包含统计信息和格式化输出的结果
 */
export function groupTasksByOwner(taskData: TaskData): GroupedTasksResult {
  const tasks = taskData.map((item) => item.Task);

  // 按 owner 分组，处理多人协作的情况
  const groupedTasks = tasks.reduce((acc, task) => {
    // 将 owner 字段按分号分割，去除空字符串和重复项
    const owners = task.owner
      .split(";")
      .map((owner) => owner.trim())
      .filter((owner) => owner !== "")
      .filter((owner, index, arr) => arr.indexOf(owner) === index); // 去重

    // 为每个 owner 添加任务
    owners.forEach((owner) => {
      if (!acc[owner]) {
        acc[owner] = [];
      }
      acc[owner].push(task);
    });

    return acc;
  }, {} as Record<string, TapdUserTask[]>);

  // 计算统计信息
  const statistics: TaskStatistics[] = [];
  let totalCompleted = 0;
  let totalProgressing = 0;
  let totalNotStarted = 0;

  Object.entries(groupedTasks).forEach(([owner, tasks]) => {
    const completed = tasks.filter((task) => task.status === "done").length;
    const progressing = tasks.filter(
      (task) => task.status === "progressing"
    ).length;
    const notStarted = tasks.filter((task) => task.status === "open").length;

    statistics.push({
      owner,
      total: tasks.length,
      completed,
      progressing,
      notStarted,
    });

    totalCompleted += completed;
    totalProgressing += progressing;
    totalNotStarted += notStarted;
  });

  // 按任务总数排序（可选）
  statistics.sort((a, b) => b.total - a.total);

  // 生成格式化输出
  let formattedOutput = "";

  // 添加数据统计
  formattedOutput += "任务数据统计\n\n";
  formattedOutput += `- 总负责人数: ${statistics.length}人\n`;
  formattedOutput += `- 任务总数: ${tasks.length}个\n`;
  formattedOutput += `- 已完成: ${totalCompleted}个\n`;
  formattedOutput += `- 进行中: ${totalProgressing}个\n`;
  formattedOutput += `- 未开始: ${totalNotStarted}个\n\n`;

  formattedOutput += "各负责人任务分布\n\n";
  statistics.forEach((stat) => {
    formattedOutput += `- ${stat.owner}: ${stat.total}个任务（已完成${stat.completed}个，进行中${stat.progressing}个，未开始${stat.notStarted}个）\n`;
  });

  formattedOutput += "\n---\n\n按处理人分组的任务列表\n\n";

  // 添加分组任务列表
  Object.entries(groupedTasks).forEach(([owner, tasks]) => {
    formattedOutput += `${owner}\n\n`;

    tasks.forEach((task) => {
      const statusText = STATUS_MAP[task.status];
      formattedOutput += `- 【${task.priority_label}】${task.name} 【${statusText}】 ${task.progress}%\n`;
    });

    formattedOutput += "\n";
  });

  return {
    statistics,
    summary: {
      totalOwners: statistics.length,
      totalTasks: tasks.length,
      totalCompleted,
      totalProgressing,
      totalNotStarted,
    },
    formattedOutput,
  };
}

// 获取统计信息的便捷函数
export function getTaskStatistics(taskData: TaskData): {
  statistics: TaskStatistics[];
  summary: GroupedTasksResult["summary"];
} {
  const result = groupTasksByOwner(taskData);
  return {
    statistics: result.statistics,
    summary: result.summary,
  };
}
