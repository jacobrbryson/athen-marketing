import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { Home } from './pages/home/home';
import { Kids } from './pages/kids/kids';
import { Login } from './pages/login/login';
import { Parents } from './pages/parents/parents';
import { LearningGoals } from './pages/learning-goals/learning-goals';
import { Activity } from './pages/activity/activity';
import { About } from './pages/about/about';
import { Store } from './pages/store/store';
import { SeeHowAthenaLearns } from './pages/see-how-athena-learns/see-how-athena-learns';
import { Teachers } from './pages/teachers/teachers';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProfileGuard } from './profile.guard';
import { TermsOfService } from './pages/terms-of-service/terms-of-service';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Athena | AI Companion',
    data: {
      description:
        'Athena is the AI learning companion built to be taught by your child. Kids teach the AI to cement knowledge, build confidence, and reach true mastery.',
      path: '',
    },
  },
  {
    path: 'kids',
    component: Kids,
    title: 'Athena | For Kids',
    data: {
      description:
        'Become the teacher! Athena is the friendly AI student that learns from you. Explain what you know and watch your own understanding grow.',
      path: 'kids',
    },
  },
  {
    path: 'parents',
    component: Parents,
    title: 'Athena | For Parents',
    data: {
      description:
        'The parent command center: full visibility into every interaction, insight into your child’s learning and emotional needs, and precise academic targets.',
      path: 'parents',
    },
  },
  {
    path: 'teachers',
    component: Teachers,
    title: 'Athena | For Teachers',
    data: {
      description:
        'Empower learning with actionable insights. Athena integrates with your curriculum and school systems to deliver personalized reinforcement while protecting student privacy.',
      path: 'teachers',
    },
  },
  {
    path: 'see-how-athena-learns',
    component: SeeHowAthenaLearns,
    title: 'Athena | See How Athena Learns',
    data: {
      description:
        'The Teach-First Method: science shows teaching a concept is the best way to learn it. See how Athena turns passive learning into active mastery.',
      path: 'see-how-athena-learns',
    },
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Athena | Dashboard',
    canActivate: [AuthGuard, ProfileGuard],
    data: { noindex: true },
  },
  {
    path: 'dashboard/store',
    component: Store,
    title: 'Athena | Store',
    canActivate: [AuthGuard, ProfileGuard],
    data: { noindex: true },
  },
  {
    path: 'dashboard/profile/:uuid/learning-goals',
    component: LearningGoals,
    title: 'Athena | Learning Goals',
    canActivate: [AuthGuard, ProfileGuard],
    data: { noindex: true },
  },
  {
    path: 'dashboard/profile/:uuid/activity',
    component: Activity,
    title: 'Athena | Activity',
    canActivate: [AuthGuard, ProfileGuard],
    data: { noindex: true },
  },
  {
    path: 'dashboard/profile/:uuid',
    component: Profile,
    title: 'Athena | Profile',
    canActivate: [AuthGuard],
    data: { noindex: true },
  },
  {
    path: 'profile',
    component: Profile,
    title: 'Athena | Profile',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    data: { noindex: true },
  },
  {
    path: 'about',
    component: About,
    title: 'Athena | About',
    data: {
      description:
        'About Athena — the AI learning companion that helps learners grow with personalized goals, feedback, and engaging experiences.',
      path: 'about',
    },
  },
  {
    path: 'login',
    component: Login,
    title: 'Athena | Login',
    data: { noindex: true },
  },
  {
    path: 'terms-of-service',
    component: TermsOfService,
    title: 'Athena | Terms of Service',
    data: {
      description: 'The terms of service governing your use of Athena.',
      path: 'terms-of-service',
    },
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicy,
    title: 'Athena | Privacy Policy',
    data: {
      description: 'How Athena collects, uses, and protects your information.',
      path: 'privacy-policy',
    },
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
