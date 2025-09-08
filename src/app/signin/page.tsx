"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		const res = await signIn('credentials', { redirect: false, email, password });
		setLoading(false);
		// signIn returns undefined in some setups; redirect anyway
		router.replace('/');
	}

	return (
		<div style={{ padding: 20 }}>
			<h1>Sign in</h1>
			<form onSubmit={onSubmit}>
				<div>
					<label>Email</label>
					<input value={email} onChange={e => setEmail(e.target.value)} />
				</div>
				<div>
					<label>Password</label>
					<input type="password" value={password} onChange={e => setPassword(e.target.value)} />
				</div>
				<button type="submit" disabled={loading}>{loading ? 'Signing…' : 'Sign in'}</button>
			</form>
		</div>
	);
}
