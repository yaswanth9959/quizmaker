import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Brain, FileText, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Create Amazing{" "}
              <span className="text-gradient">Quizzes</span>{" "}
              in Seconds
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform any topic, text, or PDF into engaging quizzes with AI. 
              Perfect for teachers, trainers, and educators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-hero text-lg px-8 py-4">
                <Link to="/create">
                  Start Creating <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 hover-scale">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for{" "}
              <span className="text-gradient">Quiz Creation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI-driven tools to create, customize, and export professional quizzes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Generation",
                description: "Generate up to 100 questions from any topic, text, or PDF using advanced AI"
              },
              {
                icon: FileText,
                title: "Multiple Input Types",
                description: "Topic names, pasted text, uploaded PDFs - create quizzes from any content"
              },
              {
                icon: BookOpen,
                title: "Question Variety",
                description: "Multiple choice, true/false, and fill-in-the-blank questions"
              },
              {
                icon: Zap,
                title: "Export & Share",
                description: "Export to PDF or Word, with optional answer keys for easy sharing"
              }
            ].map((feature, index) => (
              <Card key={index} className="card-educational animate-slide-up border-0" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center card-educational p-12 border-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of educators creating engaging quizzes with AI
            </p>
            <Button asChild size="lg" className="btn-hero text-lg px-8 py-4">
              <Link to="/create">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;