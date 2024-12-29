import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
  ) {}

  async create(createShiftDto: CreateShiftDto): Promise<Shift> {
    const existingShiftName = await this.shiftRepository.findOne({
      where: { shiftName: createShiftDto.shiftName }
    });

    const existingDepartment = await this.shiftRepository.findOne({
      where: { departmentId: createShiftDto.departmentId }
    });

    if (existingDepartment&&existingShiftName) {
      throw new ConflictException('Department has already worked on this shift');
    }

    const shift = this.shiftRepository.create({
      shiftName: createShiftDto.shiftName,
      startTime: createShiftDto.startTime,
      endTime: createShiftDto.endTime,
      departmentId: createShiftDto.departmentId,
    });
    return await this.shiftRepository.save(shift);
  }

  async createForDepartment(createShiftDto: CreateShiftDto, departmentId: string): Promise<Shift> {
    const existingShift = await this.shiftRepository.findOne({
      where: { shiftName: createShiftDto.shiftName, departmentId: departmentId }
    });

    if (existingShift) {
      throw new ConflictException(`Không thành công, Phòng đã tồn tại ${createShiftDto.shiftName} trước đó`);
    }

    const shift = this.shiftRepository.create({
      shiftName: createShiftDto.shiftName,
      startTime: createShiftDto.startTime,
      endTime: createShiftDto.endTime,
      departmentId: departmentId,
    });

    const savedShift = await this.shiftRepository.save(shift);
    return await this.shiftRepository.findOne({
      where: { id: savedShift.id },
      relations: ['department']
    });
  }

  async findAll(): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: { isActive: true },
      relations: ['department']
    });
  }

  async findByDepartment(departmentId: string): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: { 
        departmentId,
        isActive: true 
      },
      relations: ['department']
    });
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { id, isActive: true },
      relations: ['department']
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findOne(id);

    if (id === shift.id) {
      Object.assign(shift, updateShiftDto);
      return await this.shiftRepository.save(shift);
    } 

    throw new NotFoundException(`Shift with ID ${id} not found`);
    
  }

  async remove(id: string): Promise<void> {
    const shift = await this.findOne(id);
    shift.isActive = false;
    await this.shiftRepository.remove(shift);
  }
}
