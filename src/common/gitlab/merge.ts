import {
  DetailedMergeStatus,
  GitlabMergeRequest,
  MergeStatus,
} from "@/tools/gitlab/types.js";
import { delay, makeGitlabRequest } from "../utils.js";
import { createRoutineBotError } from "../errors.js";

export async function waitForMergeability(
  projectId: number | string,
  mrIID: number
) {
  const startTime = Date.now();
  const pollInterval = 2000; // 2秒轮询一次
  const maxWaitTime = 2 * 60 * 1000; // 2分钟超市

  while (Date.now() - startTime < maxWaitTime) {
    // 获取 MR 详情
    const mr = await makeGitlabRequest<GitlabMergeRequest>(
      "GET",
      `/projects/${projectId}/merge_requests/${mrIID}`
    );

		console.error(mr)

    // 检查 MR 是否可以合并
    const mergeabilityCheck = checkMergeability(mr);

    if (mergeabilityCheck.canMerge) {
      return; // 可以合并
    }

    if (mergeabilityCheck.shouldWait) {
      console.error(`Waiting... ${mergeabilityCheck.reason}`);
      await delay(pollInterval);
      continue;
    }

    // 无法合并，抛出错误
    throw createRoutineBotError(400, mergeabilityCheck.reason);
  }

  throw createRoutineBotError(
    400,
    `Timeout waiting for merge request to become mergeable after ${maxWaitTime}ms`
  );
}

/**
 * 检查 MR 是否可合并 (兼容不同 GitLab 版本)
 */
function checkMergeability(mr: GitlabMergeRequest): {
  canMerge: boolean;
  shouldWait: boolean;
  reason: string;
  code: string;
} {
  // 首先检查 MR 是否处于开放状态
  if (mr.state !== "opened") {
    return {
      canMerge: false,
      shouldWait: false,
      reason: `Merge request is ${mr.state}`,
      code: "NOT_OPEN",
    };
  }

  // 检查是否为草稿状态
  if (mr.draft || mr.work_in_progress) {
    return {
      canMerge: false,
      shouldWait: false,
      reason: "Cannot merge draft merge request",
      code: "DRAFT_STATUS",
    };
  }

  // 如果支持 detailed_merge_status (GitLab 15.6+)，优先使用
  if (mr.detailed_merge_status) {
    switch (mr.detailed_merge_status) {
      case DetailedMergeStatus.MERGEABLE:
        return { canMerge: true, shouldWait: false, reason: "", code: "" };

      case DetailedMergeStatus.CI_STILL_RUNNING:
      case DetailedMergeStatus.CHECKING:
        return {
          canMerge: false,
          shouldWait: true,
          reason: `CI/checks in progress: ${mr.detailed_merge_status}`,
          code: "CI_RUNNING",
        };

      case DetailedMergeStatus.BLOCKED_STATUS:
        return {
          canMerge: false,
          shouldWait: false,
          reason: "Merge request is blocked by branch protection rules",
          code: "BLOCKED_STATUS",
        };

      case DetailedMergeStatus.BROKEN_STATUS:
        return {
          canMerge: false,
          shouldWait: false,
          reason: "Merge request has merge conflicts",
          code: "MERGE_CONFLICTS",
        };

      case DetailedMergeStatus.CI_MUST_PASS:
        return {
          canMerge: false,
          shouldWait: false,
          reason: "CI pipeline must pass before merging",
          code: "CI_FAILED",
        };

      case DetailedMergeStatus.DISCUSSIONS_NOT_RESOLVED:
        return {
          canMerge: false,
          shouldWait: false,
          reason: "All discussions must be resolved before merging",
          code: "UNRESOLVED_DISCUSSIONS",
        };

      case DetailedMergeStatus.NOT_APPROVED:
        return {
          canMerge: false,
          shouldWait: false,
          reason: "Merge request requires approval",
          code: "NOT_APPROVED",
        };

      case DetailedMergeStatus.POLICIES_DENIED:
        return {
          canMerge: false,
          shouldWait: false,
          reason: "Merge blocked by security policies",
          code: "POLICIES_DENIED",
        };
    }
  }

  // 降级到基础的 merge_status 检查 (兼容旧版本)
  switch (mr.merge_status) {
    case MergeStatus.CAN_BE_MERGED:
      // 还需要检查其他条件
      break;

    case MergeStatus.CANNOT_BE_MERGED:
      return {
        canMerge: false,
        shouldWait: false,
        reason: "Merge request cannot be merged (likely has conflicts)",
        code: "MERGE_CONFLICTS",
      };

    case MergeStatus.UNCHECKED:
      return {
        canMerge: false,
        shouldWait: true,
        reason: "Merge status is being checked",
        code: "CHECKING",
      };
  }

  // 检查 CI 流水线状态
  if (mr.pipeline) {
    const pipelineStatus = mr.pipeline.status;
    if (["pending", "running"].includes(pipelineStatus)) {
      return {
        canMerge: false,
        shouldWait: true,
        reason: `Pipeline is ${pipelineStatus}`,
        code: "CI_RUNNING",
      };
    }

    if (["failed", "canceled", "skipped"].includes(pipelineStatus)) {
      return {
        canMerge: false,
        shouldWait: false,
        reason: `Pipeline ${pipelineStatus}`,
        code: "CI_FAILED",
      };
    }
  }

  // 检查讨论是否已解决
  if (mr.blocking_discussions_resolved === false) {
    return {
      canMerge: false,
      shouldWait: false,
      reason: "All discussions must be resolved before merging",
      code: "UNRESOLVED_DISCUSSIONS",
    };
  }

  // 检查审批状态
  if (mr.approvals && !mr.approvals.approved) {
    if (mr.approvals.approvals_left > 0) {
      return {
        canMerge: false,
        shouldWait: false,
        reason: `Merge request needs ${mr.approvals.approvals_left} more approval(s)`,
        code: "NOT_APPROVED",
      };
    }
  }

  // 如果通过了所有检查，认为可以合并
  return { canMerge: true, shouldWait: false, reason: "", code: "" };
}
