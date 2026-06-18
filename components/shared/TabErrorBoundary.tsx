"use client";

import { Component, type ReactNode } from "react";

interface Props {
  tabName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

// Class component required — React error boundaries cannot be function components.
// One per tab as required by CLAUDE.md: "one tab crashing must not break others."
export class TabErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { hasError: true, message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-700 mb-1">
            {this.props.tabName} encountered an error
          </p>
          <p className="text-xs text-red-500 font-mono">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="mt-4 text-xs text-red-600 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
