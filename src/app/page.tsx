"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Plus, MapPin, Calendar, Info, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar as CalendarWidget } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import Image from 'next/image';

type Destination = {
  id: number
  name: string
  date: string
  notes: string
  image?: string
}

export default function TravelBucketList() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [newDestination, setNewDestination] = useState("")
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newNotes, setNewNotes] = useState("")
  const [newImage, setNewImage] = useState<File | null>(null)

  useEffect(() => {
    // Load destinations from localStorage on component mount
    const savedDestinations = localStorage.getItem("travelDestinations")
    if (savedDestinations) {
      setDestinations(JSON.parse(savedDestinations))
    }

    // Apply the saved theme or default to system preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark")
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    }
  }, [])

  useEffect(() => {
    // Save destinations to localStorage whenever it changes
    localStorage.setItem("travelDestinations", JSON.stringify(destinations))
  }, [destinations])

  useEffect(() => {
    // Apply theme class to the root element
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const addDestination = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newDestination.trim() === "" || !newDate) return

    let imageUrl = ""
    if (newImage) {
      // Convert image to base64 for storage
      const reader = new FileReader()
      reader.readAsDataURL(newImage)
      imageUrl = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string)
      })
    }

    const newDest: Destination = {
      id: Date.now(),
      name: newDestination,
      date: format(newDate, "yyyy-MM-dd"),
      notes: newNotes,
      image: imageUrl,
    }
    setDestinations([...destinations, newDest])
    setNewDestination("")
    setNewDate(undefined)
    setNewNotes("")
    setNewImage(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0])
    }
  }

  const removeDestination = (id: number) => {
    setDestinations(destinations.filter(dest => dest.id !== id))
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container mx-auto p-4 flex-grow">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Travel Bucket List</h1>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </Button>
        </header>

        <form onSubmit={addDestination} className="mb-8">
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="Enter a destination"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !newDate && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarWidget
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Add some notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" /> Add Destination
            </Button>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <Card key={dest.id}>
              <CardHeader>
                <CardTitle>{dest.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dest.date}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dest.image && (
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    width={500} // Specify appropriate width
                    height={300} // Specify appropriate height
                    className="w-full h-64 object-cover my-4 rounded-md"
                  />
                )}
                <p className="text-sm">{dest.notes}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Info className="mr-2 h-4 w-4" /> View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{dest.name}</DialogTitle>
                      <DialogDescription>
                        <div className="flex items-center mb-2">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dest.date}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          {dest.name}
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    {dest.image && (
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        width={500} // Specify appropriate width
                        height={300} // Specify appropriate height
                        className="w-full h-64 object-cover my-4 rounded-md"
                      />
                    )}
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p>{dest.notes}</p>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" size="sm" onClick={() => removeDestination(dest.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Tapit.Club. All rights reserved.
      </footer>
    </div>
  )
}