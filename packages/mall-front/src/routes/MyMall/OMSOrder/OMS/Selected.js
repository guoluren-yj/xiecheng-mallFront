import { observable, action, computed, toJS } from 'mobx';

// 管理勾选类
class Selected {
  @observable
  values = [];

  @computed
  get length() {
    return this.values.length;
  }

  @action
  select(value) {
    if (this.isSelected(value)) {
      this.values = this.values.filter((f) => f !== value);
    } else {
      this.values.push(value);
    }
  }

  isSelected(value) {
    return this.values.includes(value);
  }

  clear() {
    this.values = [];
  }

  getValueStr() {
    const value = toJS(this.values);
    return value;
  }
}

export default Selected;
