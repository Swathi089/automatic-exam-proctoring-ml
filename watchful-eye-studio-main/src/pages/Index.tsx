import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  Video, 
  Lock, 
  CheckCircle,
  ArrowRight,
  GraduationCap,
  UserCog
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Video className="h-6 w-6" />,
      title: "Live Proctoring",
      description: "Real-time webcam monitoring with AI-powered behavioral analysis",
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Smart Detection",
      description: "Detect tab switching, fullscreen exits, and suspicious movements",
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Instant Alerts",
      description: "Immediate notifications to examiners when violations occur",
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Secure Environment",
      description: "Locked browser mode prevents access to unauthorized resources",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="glass" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 container mx-auto px-6 flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Shield className="h-4 w-4 text-secondary" />
                <span className="text-sm text-primary-foreground/90">AI-Powered Proctoring</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                Secure Online Exams with{' '}
                <span className="text-secondary">Intelligent</span>{' '}
                Proctoring
              </h1>
              
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
                Ensure exam integrity with real-time AI monitoring, instant violation detection, 
                and comprehensive dashboards for educators and students.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" onClick={() => navigate('/signup')} className="bg-secondary hover:bg-secondary/90">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Student Login
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button variant="glass" size="xl" onClick={() => navigate('/signup')}>
                  <UserCog className="h-5 w-5 mr-2" />
                  Examiner Login
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl animate-pulse-slow" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="webcam-frame aspect-video">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-600 mx-auto mb-2 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-slate-300" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-success/80">Live</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    4 students monitored
                  </div>
                  <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    0 alerts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Proctoring Solution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to conduct secure, fair, and monitored online examinations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Secure Your Exams?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of institutions using ProctorAI for fair and secure online assessments.
          </p>
          <Button variant="glass" size="xl" onClick={() => navigate('/signup')}>
            Get Started Free
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 ProctorAI. Secure Exam Platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
