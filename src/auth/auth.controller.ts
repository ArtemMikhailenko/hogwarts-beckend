import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    
    // Встановлення HTTP-only cookie з токеном
    response.cookie('token', result.token, {
      httpOnly: true,
      secure: true, // Завжди true для HTTPS
      sameSite: 'none', // Дозволяє cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
    });

    return {
      success: result.success,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { success: true, message: 'Ви успішно вийшли' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request: Request & { user: any }) {
    return {
      success: true,
      user: request.user,
    };
  }
}
