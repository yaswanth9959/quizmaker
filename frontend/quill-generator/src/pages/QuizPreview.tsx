import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Edit3, Check, Download, Save, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

interface Question {
  _id: string;
  question_text: string;
  question_type: 'mcq' | 'tf' | 'fill';
  options?: string[];
  correct_answer: string;
  difficulty: string;
  explanation: string;
}

const QuizPreview = () => {
  const [quizData, setQuizData] = useState<{ _id?: string; title: string; questions: Question[] } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedQuiz = sessionStorage.getItem('generatedQuiz');
    if (storedQuiz) {
      const parsedQuiz = JSON.parse(storedQuiz);
      const questionsWithIds = parsedQuiz.questions.map((q, index) => ({
        ...q,
        _id: `temp-${index}`,
      }));
      setQuizData({ ...parsedQuiz, questions: questionsWithIds });
      setQuizTitle(parsedQuiz.title);
    } else {
      navigate('/create');
      toast({
        variant: "destructive",
        title: "No Quiz Found",
        description: "Please generate a quiz first.",
      });
    }
  }, [navigate, toast]);

  const handleEdit = (_id: string) => {
    setEditingId(editingId === _id ? null : _id);
  };

  const handleSaveQuestion = (_id) => {
    setEditingId(null);
  };

  const handleSaveQuiz = async () => {
    setIsSaving(true);
    
    try {
      // Create a new object without the temporary _id fields
      const questionsToSave = quizData.questions.map(({ _id, ...rest }) => rest);

      const response = await axios.post(
        '/api/quizzes',
        { title: quizTitle, questions: questionsToSave }
      );
      
      setQuizData(prevData => ({ ...prevData, _id: response.data._id }));

      toast({ title: "Quiz Saved!", description: "Your quiz has been saved to your dashboard." });
      navigate('/dashboard');

    } catch (error) {
      console.error("Save Quiz failed:", error.response?.data || error.message);
      toast({
        variant: "destructive",
        title: "Failed to Save",
        description: error.response?.data?.msg || "An error occurred while saving the quiz."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!quizData || !quizData.questions.length) {
      toast({ variant: "destructive", title: "No Quiz Data", description: "Cannot export an empty quiz." });
      return;
    }
    
    if (!quizData._id) {
        toast({
            variant: "destructive",
            title: "Quiz Not Saved",
            description: "Please save the quiz before attempting to export."
        });
        return;
    }

    setIsExporting(true);
    
    try {
      const response = await axios.get(
        `/api/quizzes/${quizData._id}/export/${format}`,
        {
          responseType: 'blob',
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${quizTitle}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Export Successful", description: `Your quiz has been exported as a ${format.toUpperCase()} file.` });

    } catch (error) {
      console.error("Export failed:", error.response?.data || error.message);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred while exporting the quiz."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-success text-success-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "hard": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mcq": return "Multiple Choice";
      case "tf": return "True/False";
      case "fill": return "Fill in the Blank";
      default: return type;
    }
  };

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/create">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Create
              </Link>
            </Button>
            <Input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="text-3xl font-bold border-0 p-0 h-auto bg-transparent text-foreground"
            />
            <p className="text-muted-foreground mt-2">
              {quizData.questions.length} questions generated • Ready for review
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button variant="outline" className="hover-scale" onClick={handleSaveQuiz} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Quiz"}
          </Button>
          <Button variant="outline" className="hover-scale" onClick={() => handleExport('pdf')} disabled={!quizData._id || isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export PDF
          </Button>
          <Button variant="outline" className="hover-scale" onClick={() => handleExport('docx')} disabled={!quizData._id || isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export Word
          </Button>
        </div>

        <div className="space-y-6">
          {quizData.questions.map((question, index) => (
            <Card key={question._id} className="question-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {getTypeLabel(question.question_type)}
                      </Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editingId === question._id ? handleSaveQuestion(question._id) : handleEdit(question._id)}
                    className="hover-scale"
                  >
                    {editingId === question._id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Edit3 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  {editingId === question._id ? (
                    <Textarea
                      defaultValue={question.question_text}
                      className="font-medium text-lg resize-none"
                      rows={2}
                      onChange={(e) => {
                          const updatedQuestions = [...quizData.questions];
                          updatedQuestions[index].question_text = e.target.value;
                          setQuizData({ ...quizData, questions: updatedQuestions });
                      }}
                    />
                  ) : (
                    <h3 className="text-lg font-medium leading-relaxed">
                      {question.question_text}
                    </h3>
                  )}
                </div>

                {question.question_type === "mcq" && question.options && (
                  <div className="grid gap-3">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          option === question.correct_answer
                            ? "border-success bg-success/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        {editingId === question._id ? (
                          <Input 
                            defaultValue={option} 
                            className="border-0 p-0 h-auto bg-transparent"
                            onChange={(e) => {
                                const updatedQuestions = [...quizData.questions];
                                updatedQuestions[index].options[optionIndex] = e.target.value;
                                setQuizData({ ...quizData, questions: updatedQuestions });
                            }}
                          />
                        ) : (
                          <span className={option === question.correct_answer ? "font-medium text-success" : ""}>
                            {option}
                          </span>
                        )}
                        {option === question.correct_answer && (
                          <Check className="h-4 w-4 text-success ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === "tf" && (
                  <div className="flex gap-4">
                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                      (question.correct_answer as string).toLowerCase() === 'true' ? "border-success bg-success/10" : "border-border"
                    }`}>
                      <span className="font-medium">True</span>
                      {(question.correct_answer as string).toLowerCase() === 'true' && <Check className="h-4 w-4 text-success" />}
                    </div>
                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                      (question.correct_answer as string).toLowerCase() === 'false' ? "border-success bg-success/10" : "border-border"
                    }`}>
                      <span className="font-medium">False</span>
                      {(question.correct_answer as string).toLowerCase() === 'false' && <Check className="h-4 w-4 text-success" />}
                    </div>
                  </div>
                )}

                {question.question_type === "fill" && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-success bg-success/10">
                    <span className="text-sm text-muted-foreground">Correct Answer:</span>
                    <span className="font-medium text-success">{question.correct_answer}</span>
                    <Check className="h-4 w-4 text-success ml-auto" />
                  </div>
                )}

                <Separator />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Explanation: </span>
                  {editingId === question._id ? (
                    <Textarea
                      defaultValue={question.explanation}
                      className="mt-2 text-sm resize-none"
                      rows={2}
                      onChange={(e) => {
                          const updatedQuestions = [...quizData.questions];
                          updatedQuestions[index].explanation = e.target.value;
                          setQuizData({ ...quizData, questions: updatedQuestions });
                      }}
                    />
                  ) : (
                    question.explanation
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-12 pt-8 border-t">
          <Button asChild variant="outline" size="lg" className="hover-scale">
            <Link to="/create">
              Generate More Questions
            </Link>
          </Button>
          <Button size="lg" className="btn-hero" onClick={handleSaveQuiz} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;