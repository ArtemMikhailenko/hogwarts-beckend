import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Module, ModuleDocument } from '../schemas/module.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  async getAllUsers() {
    const users = await this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 });

    return users.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      faculty: user.faculty,
      isAdmin: user.isAdmin,
      earnings: user.earnings,
      completedLessonsCount: user.completedLessons?.length || 0,
      completedModulesCount: user.completedModules?.length || 0,
    }));
  }

  async assignFaculty(userId: string, faculty: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    user.faculty = faculty;
    await user.save();

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      faculty: user.faculty,
    };
  }

  async toggleAdmin(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    return {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }

  async getStats() {
    const totalUsers = await this.userModel.countDocuments();
    const modules = await this.moduleModel.find();
    const totalModules = modules.length;
    const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
    
    // Підрахунок активних користувачів (тих, хто має хоча б 1 завершений урок)
    const activeUsers = await this.userModel.countDocuments({
      $expr: { $gt: [{ $size: { $ifNull: ['$completedLessons', []] } }, 0] }
    });

    return {
      totalUsers,
      totalModules,
      totalLessons,
      activeUsers,
    };
  }
}
