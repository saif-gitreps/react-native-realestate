#### how does (root)/(tabs)/ work. and what is the _layout and index.ts in the root app folder.

one of the most important concepts in Expo Router, and once you understand it, the folder structure becomes much less confusing.

Let's use your likely structure:

app/
├── _layout.tsx
├── index.tsx
│
└── (tabs)/
├── _layout.tsx
├── index.tsx
├── explore.tsx
└── profile.tsx

1. What does (tabs) mean?

The parentheses are special.

(tabs)

is a route group.

The important part is:

The name inside parentheses does NOT become part of the URL.

Expo Router explicitly treats (tabs) as an organizational/navigation group rather than a URL segment.

So:

app/(tabs)/index.tsx

does not mean:

/tabs

It means:

/

And:

app/(tabs)/explore.tsx

means:

/explore

Not:

/tabs/explore

Think of (tabs) as an invisible folder used to organize navigation.

2. Why do people use (root)/(tabs)?

You may see something like:

app/
│
├── (root)/
│ ├── _layout.tsx
│ │
│ └── (tabs)/
│ ├── _layout.tsx
│ ├── index.tsx
│ ├── explore.tsx
│ └── profile.tsx
│
├── login.tsx
└── register.tsx

Both (root) and (tabs) are route groups.

Neither appears in the URL.

So:

app/(root)/(tabs)/index.tsx

still resolves to:

/

And:

app/(root)/(tabs)/explore.tsx

resolves to:

/explore

The reason for having two groups is usually navigation organization.

For example:

                    app
                     │
             ┌───────┴────────┐
             │                │
          (root)             login
             │
          (tabs)
             │
       ┌─────┼─────┐
       │     │     │
     index explore profile
       │     │     │
       /   /explore /profile

You can use (root) to represent the main application area, and (tabs) to represent the part of that application that has tabs.

3. What is app/_layout.tsx?

This is the root layout.

It is extremely important.

app/
├── _layout.tsx ← root layout
├── index.tsx
└── ...

_layout.tsx is not a screen/page itself.

Instead, it controls how the routes underneath it are arranged.

Expo describes the root _layout.tsx as the equivalent of where initialization/navigation setup that might previously have lived in App.tsx goes.

For example:

// app/_layout.tsx

import { Stack } from "expo-router";

export default function RootLayout() {
return <Stack />;
}

This basically says:

"Everything inside app should be managed by a Stack navigator."

4. What is app/index.tsx?

This one is a page.

app/
├── _layout.tsx
└── index.tsx

index.tsx represents the default route:

/

So:

app/index.tsx

→

http://localhost:8081/

Expo Router uses index.tsx as the default route for a directory.

For example:

// app/index.tsx

export default function Home() {
return (
<View>
<Text>Hello</Text>
</View>
);
}

When you open your app, that's the screen you get at /.

5. Then what happens with (tabs)/index.tsx?

Here's where it gets interesting.

Suppose you have:

app/
├── _layout.tsx
│
└── (tabs)/
├── _layout.tsx
├── index.tsx
├── explore.tsx
└── profile.tsx

You have:

app/(tabs)/index.tsx

That also corresponds to:

/

because (tabs) doesn't contribute to the URL.

So you generally don't need both:

app/index.tsx

and:

app/(tabs)/index.tsx

for the same routing purpose.

Usually, if your home screen is part of the tab navigator, you move the index into (tabs):

app/
├── _layout.tsx
│
└── (tabs)/
├── _layout.tsx
├── index.tsx ← /
├── explore.tsx ← /explore
└── profile.tsx ← /profile

Expo's own tab examples use this structure.

6. The two _layout.tsx files have different jobs

This is probably the biggest thing to understand.

Imagine:

app/
│
├── _layout.tsx
│
└── (tabs)/
├── _layout.tsx
├── index.tsx
├── explore.tsx
└── profile.tsx
app/_layout.tsx

Controls the entire application navigation.

For example:

import { Stack } from "expo-router";

export default function RootLayout() {
return (
<Stack>
<Stack.Screen
name="(tabs)"
options={{ headerShown: false }}
/>
</Stack>
);
}

It says:

"The (tabs) section is one part of my application's navigation."

app/(tabs)/_layout.tsx

Controls the tabs themselves.

For regular JavaScript tabs:

import { Tabs } from "expo-router";

export default function TabsLayout() {
return (
<Tabs>
<Tabs.Screen
name="index"
options={{ title: "Home" }}
/>

      <Tabs.Screen
        name="explore"
        options={{ title: "Explore" }}
      />

      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
    </Tabs>

);
}

Now:

index.tsx
explore.tsx
profile.tsx

become:

┌─────────┬─────────┬──────────┐
│ Home │ Explore │ Profile │
└─────────┴─────────┴──────────┘

The _layout.tsx defines the relationship between those pages. Expo's navigation docs describe exactly this pattern.

7. Now add (root)

This is where your question about:

(root)/(tabs)/

makes more sense.

You could have:

app/
│
├── _layout.tsx
│
├── login.tsx
├── register.tsx
│
└── (root)/
├── _layout.tsx
│
└── (tabs)/
├── _layout.tsx
├── index.tsx
├── explore.tsx
└── profile.tsx

Conceptually:

                    app
                     │
                Root Layout
                     │
          ┌──────────┴──────────┐
          │                     │
       login                 (root)
       register                  │
                           Root App Layout
                                  │
                               (tabs)
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                  Home         Explore       Profile

And the URLs remain:

/login
/register
/
/explore
/profile

because:

(root)
(tabs)

are both invisible route groups.

8. Why would you want (root) at all?

Usually because you want to separate things like:

Public screens
login
register
forgot-password

from:

Main application
(root)
(tabs)
home
search
profile

For example:

app/
│
├── _layout.tsx
│
├── login.tsx
├── register.tsx
│
└── (root)/
├── _layout.tsx
└── (tabs)/
├── _layout.tsx
├── index.tsx
├── search.tsx
└── profile.tsx

Then (root)/_layout.tsx could be responsible for the main authenticated application navigation.

This becomes particularly useful when you later add authentication/protected routes. Expo Router supports route groups specifically for structuring these relationships.

9. An easy way to remember it

Think of these three things differently:

index.tsx

"This is a screen."

index.tsx → /
_layout.tsx

"How should the screens around me be navigated/displayed?"

_layout.tsx
↓
controls its child routes
(something)

"Organize these routes without adding anything to the URL."

(tabs)
(root)
(auth)
(public)

All of those are invisible in the URL.

And for your particular project

Since you're working with Expo SDK 54 + Expo Router 6 + NativeTabs, I'd structure a real-estate app roughly like this:

app/
│
├── _layout.tsx
│
├── login.tsx
├── register.tsx
│
└── (root)/
├── _layout.tsx
│
└── (tabs)/
├── _layout.tsx
│
├── index.tsx
├── search.tsx
├── favorites.tsx
└── profile.tsx

Then the hierarchy is:

app/_layout.tsx
│
▼
(root)/_layout.tsx
│
▼
(tabs)/_layout.tsx
│
├── index.tsx → /
├── search.tsx → /search
├── favorites.tsx → /favorites
└── profile.tsx → /profile

And each layout has a different responsibility.

One important caveat: you don't have to use (root) just because tutorials do. If your app is simple, this is perfectly valid:

app/
├── _layout.tsx
└── (tabs)/
├── _layout.tsx
├── index.tsx
├── search.tsx
└── profile.tsx

In fact, I'd start with that unless you have a specific reason—such as authentication, separate stacks, or different layouts—to introduce (root).
