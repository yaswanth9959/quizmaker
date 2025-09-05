import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Upload, Brain, Settings, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

const CreateQuiz = () => {
  const [questionCount, setQuestionCount] = useState([20]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["mcq", "tf"]);
  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("text"); // Default to text
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const questionTypes = [
    { id: "mcq", label: "Multiple Choice", description: "4 options, 1 correct" },
    { id: "tf", label: "True/False", description: "Simple true or false questions" },
    { id: "fill", label: "Fill-in-the-blank", description: "Complete the sentence" }
  ];

  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, typeId]);
    } else {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (activeTab === 'text' && !pastedText.trim()) {
      toast({ variant: "destructive", title: "Input required", description: "Please enter a topic or paste text to generate a quiz." });
      return;
    }
    if (activeTab === 'pdf' && !file) {
      toast({ variant: "destructive", title: "Input required", description: "Please upload a PDF file." });
      return;
    }

    setIsLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please log in to generate a quiz." });
      setIsLoading(false);
      return;
    }

    const config = {
      headers: {
        'Content-Type': activeTab === 'pdf' ? 'multipart/form-data' : 'application/json',
        'x-auth-token': token
      },
    };

    let data: any;
    if (activeTab === 'pdf' && file) {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('numQuestions', questionCount[0].toString());
      formData.append('questionTypes', JSON.stringify(selectedTypes));
      data = formData;
    } else {
      data = {
        text: pastedText,
        numQuestions: questionCount[0],
        questionTypes: selectedTypes,
      };
    }

    try {
      const response = await axios.post('/api/quizzes/generate', data, config);
      sessionStorage.setItem('generatedQuiz', JSON.stringify(response.data));

      toast({ title: "Quiz Generated!", description: "Redirecting to quiz preview..." });
      navigate('/preview');
    } catch (error) {
      console.error("Quiz generation failed:", error);
      toast({ variant: "destructive", title: "Generation Failed", description: error.response?.data?.msg || "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Create Your <span className="text-gradient">AI Quiz</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate up to 100 questions from any content using advanced AI
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="card-educational border-0 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Content Input
                </CardTitle>
                <CardDescription>
                  Choose how you want to provide content for your quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Content</TabsTrigger>
                    <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-6">
                    <div className="space-y-4">
                      <Label htmlFor="text-content">Enter a topic or paste your content</Label>
                      <Textarea
                        id="text-content"
                        placeholder="e.g., 'JavaScript' or paste a long passage of text here..."
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{pastedText.length} / 50,000 characters</span>
                        <span>Questions will be generated from this text</span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="pdf" className="mt-6">
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Upload PDF Document</p>
                      <p className="text-muted-foreground mb-4">
                        Supports multi-page PDFs up to 50MB
                      </p>
                      <Input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden"/>
                      <Button asChild variant="outline" className="hover-scale">
                        <label htmlFor="pdf-upload">Choose File</label>
                      </Button>
                      {file && <p className="mt-2 text-sm text-muted-foreground">Selected: {file.name}</p>}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="card-educational border-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Quiz Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Number of Questions: {questionCount[0]}</Label>
                  <Slider value={questionCount} onValueChange={setQuestionCount} max={100} min={1} step={1} className="w-full"/>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Question Types</Label>
                  <div className="space-y-3">
                    {questionTypes.map((type) => (
                      <div key={type.id} className="flex items-start space-x-3">
                        <Checkbox id={type.id} checked={selectedTypes.includes(type.id)} onCheckedChange={(checked) => handleTypeChange(type.id, checked as boolean)}/>
                        <div className="grid gap-1.5 leading-none">
                          <label htmlFor={type.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {type.label}
                          </label>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Difficulty Level</Label>
                  <Select defaultValue="mixed">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full btn-hero text-lg py-6"
              onClick={handleGenerate}
              disabled={isLoading || (!pastedText && !file)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;