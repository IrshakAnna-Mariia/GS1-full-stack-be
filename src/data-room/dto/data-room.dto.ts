import type { DataRoomEntity } from '../../common/entities';

export type DataRoomDto = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
};

export function toDataRoomDto(dataRoom: DataRoomEntity): DataRoomDto {
  return {
    id: dataRoom.id,
    name: dataRoom.name,
    ownerId: dataRoom.ownerId,
    createdAt: dataRoom.createdAt,
  };
}
