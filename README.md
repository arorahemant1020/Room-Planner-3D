### StyloSpace - Interactive 3D Room Planner

A browser-based 3D room planning application that enables users to design and visualize interior spaces in real-time.

## Features

- **Custom Room Creation**: Define room dimensions (width, length, height)
- **Furniture Library**: Drag and drop furniture items into your room
- **3D Manipulation**: Move, rotate, and resize furniture with intuitive controls
- **Door Placement**: Add and customize doors on any wall
- **Realistic Visualization**: High-quality 3D rendering with proper lighting and shadows
- **Design History**: Undo/redo functionality for design iterations
- **Responsive Design**: Works on desktop and tablet devices


## Technologies

- **Frontend Framework**: Next.js, React
- **3D Rendering**: Three.js, React Three Fiber, @react-three/drei
- **UI Components**: shadcn/ui, Tailwind CSS
- **Icons**: Lucide React
- **Type Safety**: TypeScript


## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn


### Installation

1. Clone the repository:

```shellscript
git clone https://github.com/yourusername/stylospace.git
cd stylospace
```


2. Install dependencies:

```shellscript
npm install
# or
yarn install
```


3. Start the development server:

```shellscript
npm run dev
# or
yarn dev
```


4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Usage Guide

### Creating a Room

1. When you first open the application, you'll be prompted to enter room dimensions.
2. Enter the width, length, and height of your room in feet.
3. Click "Create Room" to generate your 3D space.


### Adding Furniture

1. Browse furniture categories in the sidebar.
2. Drag and drop furniture items into your room.
3. Select an item to activate the bottom toolbar with additional options.


### Manipulating Furniture

- **Move**: Click and drag the transform controls or use arrow keys.
- **Resize**: Select an item and use the resize slider in the bottom toolbar.
- **Rotate**: Select an item and use the rotation slider in the bottom toolbar.


### Adding Doors

1. Select a furniture item to activate the bottom toolbar.
2. Click the door icon to open the door placement modal.
3. Choose a wall, position, and dimensions for your door.
4. Click "Add Door" to place the door.


### Design History

- Use the undo/redo buttons in the top toolbar to navigate through your design changes.
- Reset the room to start over with a new design.


## Project Structure

```plaintext
stylospace/
├── app/                  # Next.js app directory
│   ├── components/       # React components
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Shared UI components
│   └── ui/               # shadcn/ui components
├── public/               # Static assets
│   ├── assets/           # 3D models and textures
│   └── logo.png          # Application logo
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```
