// https://open.tapd.cn/document/api-doc/API文档/使用必读.html

export interface TapdResponse<T> {
  /** 返回的状态。1 代表请求成功，其它代表失败 */
  status: number;
  /** 返回说明。如果出错，这里会给出出错信息 */
  info: string;
  /** 数据部分 */
  data: T;
}

export interface TapdUserInfo {
  /** 用户ID */
  id: string;
  /** 英文ID(nick和id都能作为用户的唯一标识) */
  nick: string;
  /** 中文名 */
  name: string;
  /** 头像 */
  avatar: string;
  /** 是否有效: 1-是;0-否 */
  enabled: 1 | 0;
  /** 状态: 1-在职;2-离职;3-冻结 */
  status_id: 1 | 2 | 3;
  /** 状态名 */
  status_name: string;
}
