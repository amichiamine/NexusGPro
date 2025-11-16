/**
 * Blog Post Template - Content Template
 * Complete blog post page demonstrating NexusG Lite v1.4.0 capabilities
 * 
 * Features demonstrated:
 * - Article layout and typography
 * - Comment system
 * - Social sharing
 * - Author information
 * 
 * @version 1.4.0
 * @created 2025-11-16
 * @author MiniMax Agent
 */

import React, { useState } from 'react';
import { cn } from '@/utils';

// Import NexusG Lite components
import Navbar from '@/components/molecules/Navbar';
import Footer from '@/components/organisms/FooterRich';
import CommentSection from '@/components/organisms/CommentSection';
import Button from '@/components/atoms/Button';
import Card from '@/components/molecules/Card';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    title: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  readingTime: string;
  category: string;
  tags: string[];
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
}

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
  className?: string;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ 
  post, 
  relatedPosts = [],
  className 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleShare = (platform: string) => {
    // Share logic
    console.log(`Sharing on ${platform}`);
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Navigation */}
      <Navbar 
        logo="NexusG Blog"
        links={[
          { label: 'Home', href: '/' },
          { label: 'Articles', href: '/articles' },
          { label: 'Categories', href: '/categories' },
          { label: 'About', href: '/about' }
        ]}
        cta={{ label: 'Subscribe', href: '/subscribe' }}
        variant="modern"
      />

      <article className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="text-sm text-muted-foreground">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>Articles</span>
            <span className="mx-2">/</span>
            <span>{post.category}</span>
          </div>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          {/* Category */}
          <div className="mb-4">
            <Badge variant="primary">{post.category}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">
              {post.subtitle}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Avatar
                src={post.author.avatar}
                alt={post.author.name}
                size="lg"
                fallback={post.author.name}
              />
              <div>
                <div className="font-semibold">{post.author.name}</div>
                <div className="text-sm text-muted-foreground">
                  {post.author.title} • {post.publishedAt} • {post.readingTime}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? "primary" : "outline"}
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                {isLiked ? '♥' : '♡'} {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button
                variant={isBookmarked ? "primary" : "outline"}
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                🔖 {isBookmarked ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
              >
                Share
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-12">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg prose-gray max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Article Footer */}
        <footer className="mb-12 pb-8 border-b">
          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Social Sharing */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Share this article</h3>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2"
              >
                🐦 Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2"
              >
                💼 LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2"
              >
                📘 Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('copy')}
                className="flex items-center gap-2"
              >
                🔗 Copy Link
              </Button>
            </div>
          </div>
        </footer>

        {/* Author Bio */}
        <section className="mb-12">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <Avatar
                src={post.author.avatar}
                alt={post.author.name}
                size="xl"
                fallback={post.author.name}
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{post.author.name}</h3>
                <p className="text-muted-foreground mb-3">{post.author.title}</p>
                <p className="text-sm">{post.author.bio}</p>
              </div>
              <Button variant="outline" size="sm">
                Follow
              </Button>
            </div>
          </Card>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted mb-4"></div>
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {relatedPost.category}
                    </Badge>
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {relatedPost.readingTime}
                      </span>
                      <Button variant="ghost" size="sm">
                        Read More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Comments</h2>
          <CommentSection
            postId={post.id}
            comments={[
              {
                id: '1',
                author: {
                  name: 'Sarah Johnson',
                  avatar: '👩‍💻',
                  verified: true
                },
                content: 'Great article! Really helpful insights on modern web development practices.',
                createdAt: '2025-01-15T10:30:00Z',
                likes: 12,
                replies: []
              },
              {
                id: '2',
                author: {
                  name: 'Mike Chen',
                  avatar: '👨‍🔬',
                  verified: false
                },
                content: 'I appreciated the detailed explanation of the technical concepts. Could you write more about implementation patterns?',
                createdAt: '2025-01-15T14:22:00Z',
                likes: 8,
                replies: [
                  {
                    id: '2-1',
                    author: {
                      name: post.author.name,
                      avatar: post.author.avatar,
                      verified: true
                    },
                    content: 'Thank you for the feedback! I\'ll definitely write a follow-up on implementation patterns.',
                    createdAt: '2025-01-15T15:45:00Z',
                    likes: 5
                  }
                ]
              }
            ]}
            variant="modern"
          />
        </section>
      </article>

      {/* Footer */}
      <Footer
        brand={{
          name: 'NexusG Blog',
          tagline: 'Insights on Modern Web Development'
        }}
        links={{
          Categories: [
            { label: 'Web Development', href: '/category/web-dev' },
            { label: 'React', href: '/category/react' },
            { label: 'TypeScript', href: '/category/typescript' },
            { label: 'UI/UX', href: '/category/ui-ux' }
          ],
          Resources: [
            { label: 'All Articles', href: '/articles' },
            { label: 'Tutorials', href: '/tutorials' },
            { label: 'Newsletter', href: '/newsletter' },
            { label: 'RSS Feed', href: '/rss' }
          ],
          About: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' }
          ]
        }}
        copyright="© 2025 NexusG Blog. All rights reserved."
      />
    </div>
  );
};

export default BlogPostPage;
