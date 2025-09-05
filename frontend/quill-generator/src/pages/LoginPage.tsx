import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "../AuthContext";

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            login();
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">Enter your email below to log in to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                            Login
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Don't have an account?{" "}
                        <Link to="/register" className="underline font-bold text-primary">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};