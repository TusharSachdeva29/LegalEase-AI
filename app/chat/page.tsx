import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
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
