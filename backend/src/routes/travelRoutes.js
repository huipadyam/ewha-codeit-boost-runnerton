import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from '../utils/asyncHandler.js';

const prisma = new PrismaClient();
const travelRouter = express.Router();
travelRouter.use(express.json());

import session from 'express-session';
import FileStore from 'session-file-store';
import passport from 'passport';

const fileStore = FileStore(session);
const sessionSecret = process.env.SESSION_SECRET;

// 미들웨어 설정
travelRouter.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new fileStore({ path: './sessions' }) // 세션 파일 저장 경로 설정
}));

travelRouter.use(passport.initialize());
travelRouter.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// 전체 여행 계획 조회
travelRouter.get('/', asyncHandler(async (req, res) => {
  const travels = await prisma.travel.findMany();
  res.send(travels);
}));

// 특정 여행 계획 조회
travelRouter.get('/:travelId', asyncHandler(async (req, res) => {
  const { travelId } = req.params;
  const travel = await prisma.travel.findUnique({
    where: { id: travelId },
  });
  if (travel) {
    res.send(travel);
  } else {
    res.status(404).send({ message: 'Cannot find given travel.' });
  }
}));

// 여행 계획 수정
travelRouter.patch('/:travelId', asyncHandler(async (req, res) => {
  const { travelId } = req.params;
  console.log(req.body);
  const travel = await prisma.travel.update({
    where: { id: travelId },
    data: req.body,
  });
  res.send(travel);
}));

// 사용자 삭제
travelRouter.delete('/:travelId', asyncHandler(async (req, res) => {
  const { travelId } = req.params;
  await prisma.travel.delete({
    where: { id: travelId },
  });
  res.sendStatus(204);
}));

export default travelRouter;