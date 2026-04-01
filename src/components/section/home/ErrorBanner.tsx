function ErrorBanner({ error }: { error: string }) {
	return (
		<div
			className="px-4 py-2 bg-red-50 border-b border-red-100 text-red-600 text-xs"
			role="alert"
			data-testid="error-banner"
		>
			{error}
		</div>
	);
}

export default ErrorBanner;
