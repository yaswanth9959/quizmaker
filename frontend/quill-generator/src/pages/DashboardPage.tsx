import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Loader2, BookOpen, Edit, Trash, Download, MoreHorizontal } from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  createdAt: string;
  questions: any[];
}

export const DashboardPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        navigate('/login');
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: "Please log in to view your dashboard.",
        });
        return;
      }

      try {
        const response = await axios.get('/api/quizzes', {
          headers: { 'x-auth-token': token },
        });
        setQuizzes(response.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch quizzes",
          description: "An error occurred while loading your quizzes.",
        });
        console.error("Error fetching quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, [navigate, toast]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`/api/quizzes/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setQuizzes(quizzes.filter(quiz => quiz._id !== id));
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been successfully removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete quiz",
        description: "An error occurred while deleting the quiz.",
      });
      console.error("Error deleting quiz:", error);
    }
  };

  const handleExport = async (id: string, format: 'pdf' | 'docx', title: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "Please log in to export quizzes.",
      });
      return;
    }

    try {
      const response = await axios.get(`/api/quizzes/${id}/export/${format}`, {
        headers: { 'x-auth-token': token },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Export Successful", description: `Your quiz has been exported as a ${format.toUpperCase()} file.` });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred while exporting the quiz.",
      });
      console.error("Error exporting quiz:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Quizzes</h1>
          <p className="text-lg text-muted-foreground">
            Your personal quiz library.
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No quizzes saved yet</h2>
            <p className="text-muted-foreground mb-4">
              Start creating quizzes from text or PDFs.
            </p>
            <Button asChild className="btn-hero">
              <Link to="/create">Create Your First Quiz</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Created on: {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  
                  {/* Single Actions Popover/Dropdown */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      <div className="flex flex-col space-y-1">
                        <Button variant="ghost" className="justify-start" onClick={() => navigate(`/quiz/${quiz._id}`)}>
                          <BookOpen className="mr-2 h-4 w-4" /> View
                        </Button>
                        <Button variant="ghost" className="justify-start" onClick={() => navigate(`/edit/${quiz._id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Separator />
                        <Button variant="ghost" className="justify-start" onClick={() => handleExport(quiz._id, 'pdf', quiz.title)}>
                          <Download className="mr-2 h-4 w-4" /> Export PDF
                        </Button>
                        <Button variant="ghost" className="justify-start" onClick={() => handleExport(quiz._id, 'docx', quiz.title)}>
                          <Download className="mr-2 h-4 w-4" /> Export Word
                        </Button>
                        <Separator />
                        <Button variant="ghost" className="justify-start text-destructive" onClick={() => handleDelete(quiz._id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;