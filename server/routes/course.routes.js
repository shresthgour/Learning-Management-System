import { Router } from "express";
import { addLecturesById, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from "../controllers/course.controller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// router.get('/', getAllCourses);
// router.get('/:id', getLecturesByCourseId);

router.route('/')
  .get(getAllCourses) 
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
  );

router.route('/:id')
  .get(
    isLoggedIn,
    getLecturesByCourseId
  )
  .put(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    updateCourse
  )
  .delete(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    removeCourse
  )
  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('lecture'),
    addLecturesById
  )


export default router;