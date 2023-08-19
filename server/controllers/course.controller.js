import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

const getAllCourses = async function (req, res, next) {
  try {
    const courses = await Course.find({}).select('-lectures');

    res.status(200).json({
      success: true,
      message: 'All Courses',
      courses,
    })
  } catch (error) {
    return next(
      new AppError('Cannot Get Courses, please try again!', 500)
    )
  }
}

const getLecturesByCourseId = async function (req, res, next) {
  try {

    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return next(
        new AppError('Invalid Course ID!', 400)
      )
    }

    res.status(200).json({
      success: true,
      message: 'Course Lectures fetched successfully!',
      lectures: course.lectures
    })

  } catch (error) {
    return next(
      new AppError('Cannot Get Lecture, please try again!', 500)
    )
  }
}

const createCourse = async function (req, res, next) {
  try {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
      return next(
        new AppError('All fields are required!', 400)
      )
    }

    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        public_id: 'Dummy',
        secure_url: 'Dummy',
      }
    })

    if (!course) {
      return next(
        new AppError('Course could not be created, please try again!', 500)
      )
    }

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms'
        })
        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
        }

        fs.rm(`uploads/${req.file.filename}`)

      } catch (error) {
        return next(
          new AppError(error.message, 500)
        )
      }
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course created successfully!',
      course,
    })
  } catch (error) {
    return next(
      new AppError(error.message, 500)
    )
  }
}

const updateCourse = async function (req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body
      },
      {
        runValidators: true
      }
    );

    if (!course) {
      return next(
        new AppError('Course with given id does not exist!', 400)
      )
    }

    res.status(200).json({
      success: true,
      message: 'Course Updated Successfully!',
      course,
    })

  } catch (error) {
    return next(
      new AppError(error.message, 500)
    )
  }
}

const removeCourse = async function (req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return next(
        new AppError('Course with given id does not exist!', 400)
      )
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course Removed Successfully!'
    })

  } catch (error) {
    return next(
      new AppError(error.message, 500)
    )
  }
}

const addLecturesById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;

    if (!title || !description) {
      return next(
        new AppError('All fields are required!', 400)
      )
    }

    const course = await Course.findById(id);

    if (!course) {
      return next(
        new AppError('Course with given id does not exist!', 400)
      )
    }

    const lectureData = {
      title,
      description,
      lecture: {}
    };

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms'
        })
        if (result) {
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
        }

        fs.rm(`uploads/${req.file.filename}`)

      } catch (error) {
        return next(
          new AppError(error.message, 500)
        )
      }
    }

    course.lectures.push(lectureData);

    course.numberOfLectures = course.lectures.length;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lecture successfully added to the course!',
      course
    })

  } catch (error) {
    return next(
      new AppError(error.message, 500)
    )
  }
}

export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLecturesById
}