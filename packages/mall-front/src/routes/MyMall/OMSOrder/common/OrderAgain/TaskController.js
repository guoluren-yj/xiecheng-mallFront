class TaskController {
  tasks = [];

  taskId = 0;

  isRunning = false;

  // 运行任务
  async run() {
    this.isRunning = true;
    for await (const item of this.tasks) {
      try {
        await item.task();
        this.tasks.shift();
      } catch {
        this.tasks.shift();
      }
    }
    if (this.tasks.length > 0) {
      await this.run();
    } else {
      this.isRunning = false;
    }
  }

  // 标记任务
  sign(task) {
    const taskId = ++this.taskId;
    return async (...rest) => {
      // 同种任务只允许存在一次
      if (this.tasks.some((s) => s.taskId === taskId)) {
        return;
      }
      this.tasks.push({
        taskId,
        task: () => task(...rest),
      });
      if (!this.isRunning) {
        await this.run();
      }
    };
  }
}

export default TaskController;
