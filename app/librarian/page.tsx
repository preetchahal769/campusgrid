"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { apiFetch } from "@/lib/api"
import {
  RiBookOpenLine,
  RiSearchLine,
  RiAddCircleLine,
  RiCalendarCheckLine,
  RiLoader4Line,
  RiArrowLeftRightLine,
  RiCheckboxCircleLine,
  RiUser3Line,
  RiBookmark3Line,
  RiAlarmWarningLine
} from "@remixicon/react"

interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  category?: string
  totalCopies: number
  availableCopies: number
}

interface Borrower {
  name: string
  email: string
  role: string
}

interface LibraryTransaction {
  id: string
  bookId: string
  borrowerId: string
  borrowedAt: string
  dueDate: string
  returnedAt?: string
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE'
  book: Book
  borrower: Borrower
}

export default function LibrarianDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  const currentTab = searchParams.get("tab") || "catalog"

  const toast = {
    error: (msg: string) => alert(`Error: ${msg}`),
    success: (msg: string) => alert(`Success: ${msg}`)
  }

  // State definitions
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingBooks, setLoadingBooks] = useState(false)

  // Book registration DTO
  const [bookTitle, setBookTitle] = useState("")
  const [bookAuthor, setBookAuthor] = useState("")
  const [bookIsbn, setBookIsbn] = useState("")
  const [bookCategory, setBookCategory] = useState("")
  const [bookCopies, setBookCopies] = useState("1")
  const [savingBook, setSavingBook] = useState(false)

  // Checkout terminal DTO
  const [selectedBookId, setSelectedBookId] = useState("")
  const [borrowerEmail, setBorrowerEmail] = useState("")
  const [returnDueDate, setReturnDueDate] = useState("")
  const [checkingOut, setCheckingOut] = useState(false)

  // Transactions ledger
  const [transactions, setTransactions] = useState<LibraryTransaction[]>([])
  const [loadingLedger, setLoadingLedger] = useState(false)

  // Initial load
  useEffect(() => {
    loadBooks()
  }, [searchQuery])

  useEffect(() => {
    if (currentTab === "loans") {
      loadLedger()
    }
  }, [currentTab])

  const loadBooks = async () => {
    setLoadingBooks(true)
    try {
      const data = await apiFetch(`/library/books?q=${searchQuery}`)
      setBooks(data)
      if (data.length > 0 && !selectedBookId) {
        setSelectedBookId(data[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingBooks(false)
    }
  }

  const loadLedger = async () => {
    setLoadingLedger(true)
    try {
      const data = await apiFetch("/library/transactions")
      setTransactions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingLedger(false)
    }
  }

  const handleRegisterBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookTitle || !bookAuthor) {
      toast.error("Title and Author are required")
      return
    }
    setSavingBook(true)
    try {
      await apiFetch("/library/books", {
        method: "POST",
        body: JSON.stringify({
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn || undefined,
          category: bookCategory || undefined,
          totalCopies: parseInt(bookCopies) || 1,
        })
      })
      toast.success("New book cataloged successfully!")
      setBookTitle("")
      setBookAuthor("")
      setBookIsbn("")
      setBookCategory("")
      setBookCopies("1")
      loadBooks()
    } catch (err: any) {
      toast.error(err.message || "Failed to register book")
    } finally {
      setSavingBook(false)
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookId || !borrowerEmail || !returnDueDate) {
      toast.error("Please fill out all checkout fields")
      return
    }
    setCheckingOut(true)
    try {
      await apiFetch("/library/checkout", {
        method: "POST",
        body: JSON.stringify({
          bookId: selectedBookId,
          borrowerEmail: borrowerEmail,
          dueDate: returnDueDate,
        })
      })
      toast.success("Book checked out successfully!")
      setBorrowerEmail("")
      setReturnDueDate("")
      loadBooks()
    } catch (err: any) {
      toast.error(err.message || "Failed to checkout book")
    } finally {
      setCheckingOut(false)
    }
  }

  const handleReturn = async (txId: string) => {
    try {
      await apiFetch(`/library/transactions/${txId}/return`, {
        method: "PATCH"
      })
      toast.success("Book returned successfully!")
      loadLedger()
      loadBooks()
    } catch (err: any) {
      toast.error(err.message || "Failed to mark book as returned")
    }
  }

  const updateTab = (tab: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", tab)
    router.push(`?${params.toString()}`)
  }

  // Calculations for stats
  const activeBorrowsCount = transactions.filter(t => !t.returnedAt).length
  const overdueCount = transactions.filter(t => !t.returnedAt && new Date(t.dueDate) < new Date()).length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-sky-600/10 via-blue-500/5 to-transparent border border-sky-600/20 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/20">
            <RiBookOpenLine className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Library Registry & Catalog</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Librarian Portal — Managing Books Inventory & Loaning Records
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 overflow-x-auto">
        {[
          { id: "catalog", label: "Inventory Catalog", icon: RiBookmark3Line },
          { id: "checkout", label: "Checkout Desk", icon: RiArrowLeftRightLine },
          { id: "loans", label: "Loaning Ledger", icon: RiCalendarCheckLine }
        ].map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => updateTab(tab.id)}
              className={`flex items-center gap-2 pb-4 font-bold text-sm tracking-tight border-b-2 transition-colors duration-300 ${
                isActive
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-muted-foreground hover:text-zinc-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tabs Content */}
      <div className="min-h-[350px]">
        {/* INVENTORY CATALOG TAB */}
        {currentTab === "catalog" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form: Register Book */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-1">
                <h3 className="text-lg font-bold tracking-tight">Catalog New Book</h3>
                <form onSubmit={handleRegisterBook} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Book Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Introduction to Algorithms"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Author</label>
                    <input
                      type="text"
                      placeholder="e.g. Thomas H. Cormen"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">ISBN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9780262033848"
                      value={bookIsbn}
                      onChange={(e) => setBookIsbn(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={bookCategory}
                        onChange={(e) => setBookCategory(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Total Copies</label>
                      <input
                        type="number"
                        min="1"
                        value={bookCopies}
                        onChange={(e) => setBookCopies(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={savingBook}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-colors"
                  >
                    {savingBook ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiAddCircleLine className="w-5 h-5" />}
                    Add Book Title
                  </button>
                </form>
              </div>

              {/* Book List Inventory */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-bold tracking-tight">Active Book Catalog</h3>
                  <div className="relative w-full sm:w-64">
                    <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search title, author, category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-sky-600"
                    />
                  </div>
                </div>

                {loadingBooks ? (
                  <div className="flex py-12 items-center justify-center">
                    <RiLoader4Line className="w-6 h-6 animate-spin text-sky-600" />
                    <span className="ml-2 text-sm text-muted-foreground">Fetching catalog library...</span>
                  </div>
                ) : books.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                    No books cataloged matching the search query. Try adding a new title.
                  </div>
                ) : (
                  <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-4">Title & Author</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">ISBN</th>
                          <th className="px-6 py-4 text-center">Available Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((b) => (
                          <tr key={b.id} className="border-b border-zinc-100 last:border-none text-sm font-semibold hover:bg-zinc-50/55 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-zinc-900">{b.title}</p>
                              <p className="text-xs text-muted-foreground">by {b.author}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-100 text-zinc-800">{b.category || "General"}</span>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-muted-foreground">{b.isbn || "N/A"}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                                b.availableCopies > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                              }`}>
                                {b.availableCopies} / {b.totalCopies} Copies
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CHECKOUT DESK TAB */}
        {currentTab === "checkout" && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-6 max-w-lg mx-auto">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Book Loan Authorization Terminal</h3>
              <p className="text-sm text-muted-foreground">Select a title and borrower email to disburse loans.</p>
            </div>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Select Book Title</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-600 bg-white"
                >
                  {books.filter(b => b.availableCopies > 0).map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</option>
                  ))}
                  {books.filter(b => b.availableCopies > 0).length === 0 && (
                    <option value="">No books currently available in catalog</option>
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Borrower Email Address</label>
                <input
                  type="email"
                  placeholder="student@school.edu"
                  value={borrowerEmail}
                  onChange={(e) => setBorrowerEmail(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Expected Return Due Date</label>
                <input
                  type="date"
                  value={returnDueDate}
                  onChange={(e) => setReturnDueDate(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-600"
                />
              </div>
              <button
                type="submit"
                disabled={checkingOut || !selectedBookId}
                className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-colors"
              >
                {checkingOut ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiArrowLeftRightLine className="w-5 h-5" />}
                Authorize Book Checkout
              </button>
            </form>
          </div>
        )}

        {/* ACTIVE LOAN LEDGER TAB */}
        {currentTab === "loans" && (
          <div className="space-y-6">
            {/* Quick Statistics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Pending Loans</span>
                  <p className="text-3xl font-black text-zinc-900">{activeBorrowsCount}</p>
                </div>
                <span className="p-3 rounded-2xl bg-sky-50 text-sky-600"><RiBookmark3Line className="w-6 h-6" /></span>
              </div>
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overdue Book Alerts</span>
                  <p className="text-3xl font-black text-red-600">{overdueCount}</p>
                </div>
                <span className="p-3 rounded-2xl bg-red-50 text-red-600"><RiAlarmWarningLine className="w-6 h-6" /></span>
              </div>
            </div>

            {/* Active Ledger Transactions Table */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold tracking-tight">Outstanding Borrow Records</h3>

              {loadingLedger ? (
                <div className="flex py-12 items-center justify-center">
                  <RiLoader4Line className="w-6 h-6 animate-spin text-sky-600" />
                  <span className="ml-2 text-sm text-muted-foreground">Fetching transaction ledger...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                  No borrowing records recorded in this system period.
                </div>
              ) : (
                <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-4">Book</th>
                        <th className="px-6 py-4">Borrower</th>
                        <th className="px-6 py-4">Checkout Date</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const isOverdue = !tx.returnedAt && new Date(tx.dueDate) < new Date()
                        return (
                          <tr key={tx.id} className="border-b border-zinc-100 last:border-none text-sm font-semibold hover:bg-zinc-50/55 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-zinc-900">{tx.book.title}</p>
                              <p className="text-xs text-muted-foreground">by {tx.book.author}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-zinc-900">{tx.borrower.name}</p>
                              <p className="text-xs text-muted-foreground">{tx.borrower.email}</p>
                            </td>
                            <td className="px-6 py-4">{new Date(tx.borrowedAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{new Date(tx.dueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                tx.returnedAt
                                  ? "bg-green-50 text-green-600"
                                  : isOverdue
                                    ? "bg-red-50 text-red-600"
                                    : "bg-amber-50 text-amber-600"
                              }`}>
                                {tx.returnedAt ? "Returned" : isOverdue ? "Overdue" : "Borrowed"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {!tx.returnedAt && (
                                <button
                                  onClick={() => handleReturn(tx.id)}
                                  className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm transition-colors"
                                >
                                  <RiCheckboxCircleLine className="w-4 h-4" />
                                  Log Return
                                </button>
                              )}
                              {tx.returnedAt && (
                                <span className="text-xs font-medium text-muted-foreground">
                                  Returned on {new Date(tx.returnedAt).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
