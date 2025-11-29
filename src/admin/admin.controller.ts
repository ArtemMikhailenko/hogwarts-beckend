import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssignFacultyDto } from './dto/assign-faculty.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:userId/faculty')
  async assignFaculty(
    @Param('userId') userId: string,
    @Body() assignFacultyDto: AssignFacultyDto,
  ) {
    return this.adminService.assignFaculty(userId, assignFacultyDto.faculty);
  }

  @Put('users/:userId/admin')
  async toggleAdmin(@Param('userId') userId: string) {
    return this.adminService.toggleAdmin(userId);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }
}
