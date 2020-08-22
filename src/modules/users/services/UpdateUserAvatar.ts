import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';
import uploadConfig from '@config/upload';
import AppError from '@shared/errors/AppError';

import User from '../infra/typeorm/entities/User';

interface Request {
  userId: string;
  avatarFilename: string;
}

class UpdateUserAvatarService {
  public async execute({ userId, avatarFilename }: Request): Promise<User> {
    const usersRepository = getRepository(User);
    // Validar o ID do usuario

    const user = await usersRepository.findOne(userId);

    if (!user) {
      throw new AppError('Only authenticated users can change Avatars', 401);
    }

    if (user.avatar) {
      // Deletar Avatar anterior

      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);

      // stat()- Verificar se o arquivo existe
      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);

      // Caso sim DELETE usando unlink
      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath);
      }
    }

    // Atualizar o usuario caso o usuario ja exista
    user.avatar = avatarFilename;

    await usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;