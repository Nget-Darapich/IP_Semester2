import {
  Get,
  Param,
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get('/')
  findAll() {
    return this.userService.findAll();
  }

  @Post('/')
  createUser(@Body() body: createUserDto) {
    return this.userService.createUser(body);
  }

  @Patch('/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { username: string; email: string; password: string },
  ) {
    return this.userService.updateUser(id, body);
  }

  @Delete('/users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
