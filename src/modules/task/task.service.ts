import { Injectable } from '@nestjs/common';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  createTask(taskData: Partial<Task>) {
    const task = this.taskRepo.create(taskData);
    return this.taskRepo.save(task);
  }

  findAllTasks() {
    return this.taskRepo.find({ relations: ['user'] });
  }

  findOneTask(id: number) {
    return this.taskRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async updateTask(id: number, updateData: Partial<Task>) {
    await this.taskRepo.update(id, updateData);
    return this.findOneTask(id);
  }

  deleteTask(id: number) {
    return this.taskRepo.delete(id);
  }
}
