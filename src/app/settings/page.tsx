'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const sidebarItems = [
  { key: 'profile', label: 'Profile' },
  { key: 'account', label: 'Account' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'display', label: 'Display' },
];

export default function SettingsPage() {
  const [selected, setSelected] = useState('profile');
  const [username, setUsername] = useState('shadcn');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('I own a computer.');
  const [urls, setUrls] = useState(['https://shadcn.com', 'http://twitter.com/shadcn']);
  const [newUrl, setNewUrl] = useState('');

  function handleAddUrl() {
    if (newUrl.trim()) {
      setUrls([...urls, newUrl.trim()]);
      setNewUrl('');
    }
  }

  function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    // Save logic here
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-2">
      <Card className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden shadow-xl">
        {/* Sidebar */}
        <aside className="bg-muted/50 md:min-w-[200px] border-r border-border flex flex-row md:flex-col">
          <nav className="w-full">
            {sidebarItems.map(item => (
              <button
                key={item.key}
                className={`w-full text-left px-6 py-3 text-base font-medium transition-colors ${selected === item.key ? 'bg-background text-primary' : 'text-muted-foreground hover:bg-muted'} ${item.key === 'profile' ? 'rounded-t-md md:rounded-t-none md:rounded-l-md' : ''}`}
                onClick={() => setSelected(item.key)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <div className="flex-1 p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>Manage your account settings and set e-mail preferences.</CardDescription>
          </CardHeader>
          <Separator className="mb-8" />
          {selected === 'profile' && (
            <form className="max-w-2xl" onSubmit={handleUpdateProfile}>
              <h2 className="text-xl font-semibold mb-2">Profile</h2>
              <p className="text-muted-foreground mb-6">This is how others will see you on the site.</p>
              <div className="mb-6">
                <Label htmlFor="username" className="mb-1 block">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} className="mb-1" />
                <p className="text-xs text-muted-foreground">This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.</p>
              </div>
              <div className="mb-6">
                <Label htmlFor="email" className="mb-1 block">Email</Label>
                <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Select a verified email to display" />
                <p className="text-xs text-muted-foreground">You can manage verified email addresses in your email settings.</p>
              </div>
              <div className="mb-6">
                <Label htmlFor="bio" className="mb-1 block">Bio</Label>
                <Input id="bio" value={bio} onChange={e => setBio(e.target.value)} />
                <p className="text-xs text-muted-foreground">You can @mention other users and organizations to link to them.</p>
              </div>
              <div className="mb-6">
                <Label className="mb-1 block">URLs</Label>
                {urls.map((url, idx) => (
                  <Input key={idx} value={url} readOnly className="mb-2" />
                ))}
                <div className="flex gap-2">
                  <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Add URL" />
                  <Button type="button" onClick={handleAddUrl} variant="secondary">Add URL</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Add links to your website, blog, or social media profiles.</p>
              </div>
              <Button type="submit" className="mt-4 w-full md:w-auto">Update profile</Button>
            </form>
          )}
          {/* Other sections can be added here as needed */}
        </div>
      </Card>
    </div>
  );
} 