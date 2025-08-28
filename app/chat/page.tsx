import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatInterface } from "@/components/chat-interface"
import { ArrowLeft } from "lucide-react"
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-4 pr-4 flex justify-end">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      <main className="container mx-auto px-4 py-4 mb-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Legal AI Assistant</h1>
            <p className="text-muted-foreground text-lg">
              Get instant legal guidance and ask questions about your documents
            </p>
          </div>
          <ChatInterface />
        </div>
      </main>
      <Footer />
    </div>
  )
}
