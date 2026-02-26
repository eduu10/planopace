import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'database';
import { UpdateUserDto, UpdateProfileDto } from './users.dto';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, stravaAccount: { select: { stravaId: true, scope: true } } },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto) {
    return prisma.user.update({ where: { id }, data: dto });
  }

  async getAthleteProfile(userId: string) {
    const profile = await prisma.athleteProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Perfil de atleta não encontrado');
    return profile;
  }

  async upsertAthleteProfile(userId: string, dto: UpdateProfileDto) {
    return prisma.athleteProfile.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}
