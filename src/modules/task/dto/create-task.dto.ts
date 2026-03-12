import { IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class createTaskDto {
  @IsString({ message: 'ឈ្មោះ task ត្រូវតែជាអក្សរ' })
  @MinLength(2, { message: 'ឈ្មោះ task ត្រូវតែមានយ៉ាងហោចណាស់ 2 អក្សរ' })
  name: string;

  @IsOptional()
  @IsString({ message: 'ការពិពណ៌នាត្រូវតែជាអក្សរ' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'completedAt ត្រូវតែជាទម្រង់ថ្ងៃត្រឹមត្រូវ' })
  completedAt?: Date;
}
