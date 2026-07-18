import { Project as IProject } from './types';

/**
 * プロジェクト集約ルートの具象クラス。
 * 外部で定義された `Project` インターフェース型を実装する。
 */
export class Project implements IProject {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
