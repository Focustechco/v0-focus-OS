export interface ClickUpWorkspace {
  id: string;
  name: string;
  color: string;
  avatar: string;
  members: ClickUpMember[];
}

export interface ClickUpMember {
  user: {
    id: number;
    username: string;
    email: string;
    color: string;
    profilePicture: string;
    initials: string;
  };
}

export interface ClickUpSpace {
  id: string;
  name: string;
  private: boolean;
  statuses: ClickUpStatus[];
  multiple_assignees: boolean;
  features: any;
}

export interface ClickUpStatus {
  id?: string;
  status: string;
  type: string;
  orderindex: number;
  color: string;
}

export interface ClickUpFolder {
  id: string;
  name: string;
  orderindex: number;
  override_statuses: boolean;
  hidden: boolean;
  space: { id: string; name: string };
  lists: ClickUpList[];
}

export interface ClickUpList {
  id: string;
  name: string;
  orderindex: number;
  status: ClickUpStatus | null;
  priority: ClickUpPriority | null;
  assignee: any;
  task_count: number;
  folder: { id: string; name: string };
  space: { id: string; name: string };
}

export interface ClickUpTask {
  id: string;
  custom_id?: string;
  name: string;
  text_content?: string;
  description?: string;
  status: ClickUpStatus;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed: string | null;
  date_done: string | null;
  creator: ClickUpUser;
  assignees: ClickUpUser[];
  checklists: any[];
  tags: any[];
  parent: string | null;
  priority: ClickUpPriority | null;
  due_date: string | null;
  start_date: string | null;
  points: number | null;
  time_estimate: number | null;
  custom_fields: ClickUpCustomField[];
  list: { id: string; name: string };
  folder: { id: string; name: string };
  space: { id: string; name: string };
  url: string;
}

export interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  initials: string;
  profilePicture: string | null;
}

export interface ClickUpPriority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config: any;
  date_created: string;
  hide_from_guests: boolean;
  value?: any;
  required?: boolean;
}

export interface ClickUpSprint {
  id: string;
  name: string;
  orderindex: number;
  status: string;
  goals?: string;
  start_date: string;
  end_date: string;
  tasks: ClickUpTask[];
}
