import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): any[] {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): any {
    return this.usersService.findById(id);
  }

  @Get('role/:role')
  findByRole(@Param('role') role: string): any[] {
    return this.usersService.findByRole(role);
  }

  @Post()
  create(@Body() data: any): any {
    return this.usersService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any): any {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { success: boolean } {
    return { success: this.usersService.delete(id) };
  }
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  login(@Body() data: { username: string; password: string }): any {
    const user = this.usersService.authenticate(data.username, data.password);
    if (!user) {
      return { error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    }
    return {
      success: true,
      user,
      token: `demo-token-${user.id}`
    };
  }

  @Post('logout')
  logout(): { success: boolean } {
    return { success: true };
  }
}
