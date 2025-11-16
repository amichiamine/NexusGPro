/**
 * Course Page Template - LMS Template
 * Complete course showcase page demonstrating NexusG Lite v1.4.0 capabilities
 * 
 * Features demonstrated:
 * - Course curriculum and navigation
 * - Progress tracking
 * - Instructor information
 * - Student reviews
 * 
 * @version 1.4.0
 * @created 2025-11-16
 * @author MiniMax Agent
 */

import React, { useState } from 'react';
import { cn } from '@/utils';

// Import NexusG Lite components
import Navbar from '@/components/molecules/Navbar';
import CourseCard from '@/components/organisms/lms/CourseCard';
import CourseHero from '@/components/organisms/lms/CourseHero';
import CourseNavigation from '@/components/organisms/lms/CourseNavigation';
import CourseSidebar from '@/components/organisms/lms/CourseSidebar';
import CourseProgress from '@/components/organisms/lms/CourseProgress';
import CourseReview from '@/components/organisms/lms/CourseReview';
import Button from '@/components/atoms/Button';
import Card from '@/components/molecules/Card';
import Badge from '@/components/atoms/Badge';
import Accordion from '@/components/molecules/Accordion';
import Modal from '@/components/molecules/Modal';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
    bio: string;
    rating: number;
    students: number;
  };
  price: number;
  originalPrice?: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  students: number;
  rating: number;
  reviews: number;
  lessons: number;
  projects: number;
  certificate: boolean;
  thumbnail: string;
  curriculum: {
    id: string;
    title: string;
    duration: string;
    type: 'video' | 'quiz' | 'assignment';
    completed?: boolean;
    isLocked?: boolean;
  }[];
  learningGoals: string[];
  prerequisites: string[];
  features: string[];
}

interface CoursePageProps {
  course: Course;
  enrolled?: boolean;
  progress?: number;
  className?: string;
}

const CoursePage: React.FC<CoursePageProps> = ({ 
  course, 
  enrolled = false, 
  progress = 0,
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews' | 'instructor'>('overview');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const handleEnroll = () => {
    if (enrolled) {
      // Continue course logic
    } else {
      setIsEnrollModalOpen(true);
    }
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Navigation */}
      <Navbar 
        logo="NexusG Learn"
        links={[
          { label: 'Courses', href: '/courses' },
          { label: 'Categories', href: '/categories' },
          { label: 'My Learning', href: '/learning' }
        ]}
        cta={{ label: enrolled ? 'Continue Learning' : 'Sign In', href: enrolled ? '#continue' : '#login' }}
        variant="modern"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="text-sm text-muted-foreground">
            Home / Courses / {course.category} / {course.title}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Hero */}
            <CourseHero
              title={course.title}
              description={course.description}
              instructor={course.instructor}
              thumbnail={course.thumbnail}
              duration={course.duration}
              level={course.level}
              category={course.category}
              enrolled={enrolled}
              progress={progress}
              onEnroll={handleEnroll}
              variant="modern"
            />

            {/* Progress (if enrolled) */}
            {enrolled && progress > 0 && (
              <div className="mb-8">
                <CourseProgress
                  completed={progress}
                  total={100}
                  lessonsCompleted={Math.round((progress / 100) * course.lessons)}
                  totalLessons={course.lessons}
                  currentLesson="Introduction to Modern Web Development"
                  variant="modern"
                />
              </div>
            )}

            {/* Course Navigation Tabs */}
            <div className="border-b mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'curriculum', label: 'Curriculum' },
                  { id: 'reviews', label: 'Reviews' },
                  { id: 'instructor', label: 'Instructor' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      'py-4 px-1 border-b-2 font-medium text-sm',
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* What you'll learn */}
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.learningGoals.map((goal, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-green-500 text-lg">✓</span>
                          <span>{goal}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Prerequisites */}
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-blue-500">•</span>
                          <span>{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Course Features */}
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Course Features</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lessons:</span>
                          <span className="font-medium">{course.lessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Projects:</span>
                          <span className="font-medium">{course.projects}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Certificate:</span>
                          <span className="font-medium">{course.certificate ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Level:</span>
                          <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'destructive'}>
                            {course.level}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Students:</span>
                          <span className="font-medium">{course.students.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Course Curriculum</h2>
                    <span className="text-muted-foreground">
                      {course.lessons} lessons • {course.duration}
                    </span>
                  </div>

                  <Accordion
                    items={course.curriculum.map((section) => ({
                      id: section.id,
                      title: section.title,
                      content: (
                        <div className="space-y-2">
                          {section.type === 'video' && (
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-blue-500">▶</span>
                                <span>Video Lesson ({section.duration})</span>
                              </div>
                              {enrolled && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedLesson(section.id)}
                                >
                                  {section.completed ? 'Review' : 'Start'}
                                </Button>
                              )}
                            </div>
                          )}
                          {section.type === 'quiz' && (
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-green-500">📝</span>
                                <span>Quiz ({section.duration})</span>
                              </div>
                              {enrolled && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={section.isLocked}
                                >
                                  Take Quiz
                                </Button>
                              )}
                            </div>
                          )}
                          {section.type === 'assignment' && (
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-purple-500">📋</span>
                                <span>Assignment ({section.duration})</span>
                              </div>
                              {enrolled && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={section.isLocked}
                                >
                                  View Assignment
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    }))}
                    variant="modern"
                  />
                </Card>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews Summary */}
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                    <div className="flex items-center gap-8 mb-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{course.rating}</div>
                        <div className="flex mb-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={cn(
                              'text-lg',
                              i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-muted-foreground'
                            )}>
                              ★
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {course.reviews} reviews
                        </div>
                      </div>
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3 mb-2">
                            <span className="text-sm">{stars}★</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ 
                                  width: stars === 5 ? '70%' : stars === 4 ? '20%' : '10%' 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {stars === 5 ? '70%' : stars === 4 ? '20%' : '10%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Individual Reviews */}
                  <CourseReview
                    rating={5}
                    author="Sarah Johnson"
                    date="2025-01-15"
                    review="Excellent course! The instructor explains concepts clearly and the hands-on projects really help solidify the learning. Highly recommended for beginners."
                    helpful={24}
                  />
                  <CourseReview
                    rating={4}
                    author="Mike Chen"
                    date="2025-01-10"
                    review="Great content and well-structured curriculum. The pacing is good and the examples are practical. Would love to see more advanced topics covered."
                    helpful={18}
                  />
                  <CourseReview
                    rating={5}
                    author="Emily Rodriguez"
                    date="2025-01-05"
                    review="This course transformed my understanding of web development. The instructor's teaching style is engaging and the projects are portfolio-worthy."
                    helpful={31}
                  />
                </div>
              )}

              {activeTab === 'instructor' && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Meet Your Instructor</h2>
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-2xl">
                      {course.instructor.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{course.instructor.name}</h3>
                      <p className="text-muted-foreground mb-3">{course.instructor.title}</p>
                      <p className="text-sm mb-4">{course.instructor.bio}</p>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="font-medium">Rating:</span> {course.instructor.rating}/5
                        </div>
                        <div>
                          <span className="font-medium">Students:</span> {course.instructor.students.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Card */}
            <CourseCard
              title={course.title}
              price={course.price}
              originalPrice={course.originalPrice}
              duration={course.duration}
              level={course.level}
              students={course.students}
              rating={course.rating}
              thumbnail={course.thumbnail}
              enrolled={enrolled}
              onEnroll={handleEnroll}
              variant="sidebar"
            />

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Course Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lessons:</span>
                  <span className="font-medium">{course.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projects:</span>
                  <span className="font-medium">{course.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate:</span>
                  <span className="font-medium">{course.certificate ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll in Course"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You're about to enroll in "{course.title}"
          </p>
          <div className="flex justify-between items-center">
            <span className="font-medium">Total:</span>
            <span className="text-2xl font-bold">${course.price}</span>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setIsEnrollModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEnrollModalOpen(false);
                // Handle enrollment logic
              }}
              className="flex-1"
            >
              Enroll Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CoursePage;
