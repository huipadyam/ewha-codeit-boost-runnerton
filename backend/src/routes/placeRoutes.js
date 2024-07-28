import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from '../utils/asyncHandler.js'; // 1. 비동기 핸들러 래퍼 가져오기

const placeRouter = Router();
const prisma = new PrismaClient();

// 여행지 생성
placeRouter.post('/', asyncHandler(async (req, res) => { // 2. 비동기 핸들러로 감싸주기
        const { name, description, location, rating } = req.body;
        const newPlace = await prisma.place.create({
            data: {
                name,  // string
                description, // string
                location, // latitude, longitude 포함 json
                rating // float
            }
        });

        res.status(201).json(newPlace);

}));

// 여행지 수정
placeRouter.put('/:placeId', asyncHandler(async (req, res) => {
        const { placeId } = req.params;
        const { name, description, location, rating } = req.body;

        const updateData = {};
        if( name ) updateData.name = name; // req body에 일부 필드만 오더라도 수정 가능
        if( description ) updateData.description = description;
        if( location ) updateData.location = location;
        if( rating ) updateData.rating = rating;

        const updatedPlace = await prisma.place.update({
            where: { id: placeId },
            data: updateData // 중괄호 넣으면 안 됨
        });
        res.status(200).json(updatedPlace);
}));

// 여행지 삭제
placeRouter.delete('/:placeId', asyncHandler(async (req, res) => {

        const { placeId } = req.params;

        await prisma.place.delete({
            where: { id: placeId }
        });

        res.status(200).json({ message: "successfully deleted" }); // 상태코드 204는 바디 못보냄, send보다 json으로 하는게 일관성있음

})); // 세미콜론 잊지말기

// 여행지 검색
placeRouter.get('/', asyncHandler(async (req, res) => {
        const { name, description, rating } = req.query;

        const where = {};
        if ( name ) where.name = { contains: name }; // insensitive mode(대소문자 구분 없이 검색) 오류나서 못 씀
        if ( description ) where.description = { contains: description };
        if ( rating ) where.rating = { gte: parseFloat(rating) };

        const places = await prisma.place.findMany({
            where
        });

        res.status(200).json(places);

}));

// 여행지 목록 조회
placeRouter.get('/', asyncHandler(async (req, res) => {
        const places = await prisma.place.findMany();
        res.status(200).json(places); 
}));

// 여행지 상세 조회
placeRouter.get('/:placeId', asyncHandler(async (req, res) => {

        const { placeId } = req.params;
        const place = await prisma.place.findUnique({
            where: { id: placeId }
        });
        if(!place){
            return res.status(404).json({ message: 'Place not found'}); // return - 함수 실행을 명확히 종료시킴
        } else{
            res.status(200).json(place);
        }

}));

// 여행지 찜 등록
placeRouter.post('/:placeId/wish', asyncHandler(async (req, res) => {
    const { placeId } = req.params;
    const { userId, comment } = req.body;
    const newWish = await prisma.wish.create({
        data: {
            userId,
            placeId,
            comment
        }
    });
    res.status(201).json(newWish);
}));

// 여행지 찜 삭제
placeRouter.delete('/:placeId/wish', asyncHandler(async (req, res) => {
    const { placeId } = req.params;
    const { userId } = req.body;
    await prisma.wish.deleteMany({ // many가 안전하기는 할 듯.. 다른데서 확실히 1대1 보장받는거 아니면
        where: {
            userId,
            placeId // 순서 안중요
        }
    });
    res.status(200).json({message: "성공적으로 삭제되었습니다."});
}));
/////////////////////////////////////////////////////////////////////////////////테스트완

// 여행지 찜 수 조회
placeRouter.get('/:placeId/wishCount', asyncHandler(async (req, res) => {
    const { placeId } = req.params;
    const count = await prisma.wish.count({
        where: {placeId}
    });
    res.status(200).json({count});
}));

// 여행지 리뷰 등록
placeRouter.post('/:placeId/reviews', asyncHandler(async (req, res) => {
    const { placeId } = req.params;
    const { userId, comment } = req.body;
    const newWish = await prisma.wish.create({
        data: {
            userId,
            placeId,
            comment
        }
    });
    res.status(201).json(newWish);
}));

// 여행지 찜 삭제
placeRouter.delete('/:placeId/wish', asyncHandler(async (req, res) => {
    const { placeId } = req.params;
    const { userId } = req.body;
    await prisma.wish.deleteMany({ // many가 안전하기는 할 듯.. 다른데서 확실히 1대1 보장받는거 아니면
        where: {
            userId,
            placeId // 순서 안중요
        }
    });
    res.status(200).json({message: "성공적으로 삭제되었습니다."});
}));


// 여행지 찜 수 조회
placeRouter.get('/:placeId/wishCount', asyncHandler(async (req, res) => {
    const { placeId } = req.params;
    const count = await prisma.wish.count({
        where: {placeId}
    });
    res.status(200).json({count});
}));


export default placeRouter;