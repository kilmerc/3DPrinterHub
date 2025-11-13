# **Project Specification: 3D Print Manager**

## **1\. Project Overview**

Project Name: 3D Print Hub  
Goal: A React-based single-page application to help a 3D printing hobbyist manage multiple printers, track filament inventory, maintain a prioritized print queue, and schedule print jobs to optimize printer uptime.  
Technology Stack:

* **Core Framework:** **React**.  
* **Styling:** **Tailwind CSS**.  
* **State Management:** **React Context** (e.g., useContext hook) will be used to provide global state (printers, filaments, queue, etc.) to all components.  
* **Logic:** All UI and logic will be built as React functional components and custom hooks.  
* **Data Persistence:** **Local JSON file (Import/Export)**. The application state is held in React Context during use.

## **1.B. Development & Deployment Workflow**

This project structure requires a Node.js environment for development.

1. **Installation:** Run npm install in the terminal to install React and other dependencies.  
2. **Local Development:** Run npm run dev to start the development server. This provides a live preview with hot-reloading.  
3. **Local Build:** When ready to deploy, run npm run build. This command will compile all the React/JSX code and create a static, optimized version of the app in a dist folder.  
4. **GitHub Pages Deployment:**  
   * Push your *entire project* (including the dist folder) to your GitHub repository.  
   * In your GitHub repo's **Settings \> Pages**, set the deploy source to the dist folder (or docs if you configure it) on your main branch.

## **1.C. File Structure**

Here is the recommended file structure for this React project:

/ (project-root)  
├── index.html          \<\!-- Main HTML entry point \--\>  
├── package.json        \<\!-- Project dependencies and scripts (dev, build) \--\>  
├── tailwind.config.js  \<\!-- Tailwind configuration \--\>  
├── postcss.config.js   \<\!-- PostCSS config for Tailwind \--\>  
├── dist/               \<\!-- The built/optimized app (for GitHub Pages) \--\>  
└── src/  
    ├── index.css       \<\!-- Main CSS file (to import Tailwind directives) \--\>  
    ├── main.jsx        \<\!-- React app entry point (renders App.jsx) \--\>  
    ├── App.jsx         \<\!-- Main app component, handles page routing, layout \--\>  
    │  
    ├── components/     \<\!-- Reusable UI components \--\>  
    │   ├── Modal.jsx  
    │   ├── DatalistInput.jsx   \<\!-- The dynamic \<input\>/\<datalist\> component \--\>  
    │   └── ImportModal.jsx   \<\!-- The initial data import screen \--\>  
    │  
    ├── contexts/  
    │   └── AppContext.jsx    \<\!-- Manages ALL global state (replaces state.js) \--\>  
    │  
    ├── hooks/  
    │   └── useFileHandler.js \<\!-- Contains exportData/importData logic (replaces fileHandler.js) \--\>  
    │  
    └── pages/  
        ├── FilamentInventory.jsx   \<\!-- Renders Page 1 \--\>  
        ├── PrintQueue.jsx        \<\!-- Renders Page 2 \--\>  
        ├── PrintScheduler.jsx    \<\!-- Renders Page 3 \--\>  
        └── Settings.jsx          \<\!-- Renders Page 4 \--\>

## **2\. Core Features & Pages**

The application will be a single-page app (SPA). App.jsx will manage which page component is currently visible (e.g., Filament, Queue, Scheduler, Settings).

### **2.A. Data Handling (Import/Export Workflow)**

* **On Application Load (Import):**  
  * Handled by the ImportModal.jsx component.  
  * This modal will be shown on load if no data is in the AppContext.  
  * It will contain a file input or drag-and-drop zone.  
  * The useFileHandler.js hook will parse the file and pass the data to AppContext to populate the global state.  
  * If no file is provided, AppContext will initialize with a default empty state.  
* **In-App Save (Export):**  
  * A dedicated "Export Data" button (likely in Settings.jsx).  
  * When clicked, it will call the exportData function from the useFileHandler.js hook.  
  * This hook will get the current state from AppContext, bundle it into a JSON object, and trigger a browser download.  
  * **Filename Convention:** 3d\_print\_hub\_backup\_YYYY-MM-DD\_HH-mm-ss.json.

### **Page 1: Filament Inventory**

* **Component:** pages/FilamentInventory.jsx.  
* **State:** Uses data from AppContext.  
* **Purpose:** Track all filament spools.  
* **UI:**  
  * A grid or list view of all filament spools.  
  * Each spool "card" will display: Brand, Type, Color, Remaining Grams (e.g., "650g / 1000g"). A visual progress bar is highly desirable.  
  * A "Low Filament" warning (e.g., \< 100g) on relevant spools.  
  * An "Add New Spool" button (opens a Modal.jsx).  
* **Functionality:**  
  * **Add Spool:** A modal form to add a new Filament spool. Form will include:  
    * Brand, Type, Color (using the DatalistInput.jsx component).  
    * Initial Filament Weight (g).  
    * Empty Spool Weight (g).  
    * On creation, remaining\_g is set to initialFilamentWeight\_g.  
  * **Dynamic Dropdowns:** The DatalistInput.jsx component **must** be used for Brand, Type, and Color. This component will implement the \<input\> \+ \<datalist\> behavior, providing auto-filtering and auto-complete.  
  * **New Value Persistence:** If a user types a new value and submits, the form logic will call a function in AppContext to add that value to the dropdownOptions object.  
  * **Update Spool Weight (Manual):** A modal to update weight.  
    * **Prompt:** "Enter Current Total Weight (on scale):"  
    * **Input:** A number field.  
    * **Logic:** The component calculates new\_remaining\_g \= CurrentTotalWeight \- emptySpoolWeight\_g and updates the spool's state in AppContext.  
    * **Note:** This is the primary method for manually adjusting filament for failed prints, etc.  
  * **"Finish" Spool:** A button to archive or delete a spool.

### **Page 2: Print Queue**

* **Component:** pages/PrintQueue.jsx.  
* **State:** Uses data from AppContext.  
* **Purpose:** A backlog of all print jobs.  
* **UI:**  
  * A list view of all queued PrintJob items, sortable by urgency.  
  * Each item displays: Job Name, Urgency, Print Time, Filament Usage, Required Type/Color.  
  * URL is a clickable link.  
  * "Add New Job" button.  
  * "Send to Scheduler" button on each job.  
* **Functionality:**  
  * **Add Job:** A modal form to add a new PrintJob. Includes:  
    * printSizeX, printSizeY (mm).  
    * amsRequired (checkbox).  
    * compatiblePrinterIds (multi-select list, populated from AppContext).  
  * **Dynamic Dropdowns:**  
    * urgency: Uses DatalistInput.jsx.  
    * requiredType: Uses DatalistInput.jsx (bound to dropdownOptions.types).  
    * requiredColor: Uses DatalistInput.jsx (bound to dropdownOptions.colors).  
  * **New Value Persistence:** New values are added to dropdownOptions in AppContext.  
  * **Edit/Delete Job:** Standard CRUD operations.  
  * **Prioritization:** Drag-and-drop or simple sorting.

### **Page 3: Print Scheduler**

* **Component:** pages/PrintScheduler.jsx.  
* **State:** Uses data from AppContext.  
* **Purpose:** Visually plan print jobs around user "Intervention Times".  
* **UI:**  
  * A timeline view (e.g., 24-48 hours).  
  * A vertical "lane" for each Printer.  
  * A "Queue" panel/sidebar.  
  * **Vertical Markers:** The timeline **must** display clear vertical lines for all upcoming InterventionTimes from AppContext.  
* **Functionality:**  
  * **Drag-and-Drop:** Drag job from "Queue" to a printer's timeline.  
  * **Visual Validation:** UI indicates valid/invalid drop based on validation rules.  
  * **Validation (on drop):**  
    1. **Printer Match:** job.compatiblePrinterIds is empty OR includes printer.id.  
    2. **AMS Match:** job.amsRequired is false OR printer.hasAMS is true.  
    3. **Bed Size Match:** job.printSizeX \<= printer.bedSizeX AND job.printSizeY \<= printer.bedSizeY (or rotated).  
  * **"Snap" to Intervention:** If valid, a modal appears:  
    * "Schedule job relative to 'Lunch' (12:00 PM)?"  
    * **Option 1: FINISH at 12:00 PM**  
    * **Option 2: START at 12:00 PM**  
  * **Job Assignment:** A final modal to confirm:  
    1. Printer.  
    2. Assign a specific Filament spool.  
    3. Add a Buffer Time (e.g., 0.25 hours).  
  * **Invalid Drop:** Show non-blocking notification.  
  * **Visual Block:** Places a block on the timeline.  
  * **Start/Complete & Deduction:**  
    * "Start Print" button updates status in AppContext.  
    * "Mark Complete" button is the **explicit trigger** for deduction. It will:  
      1. Set Printer status to "Idle".  
      2. Set PrintJob status to "Completed".  
      3. **Subtract** filamentUsage\_g from the assigned spool's remaining\_g in AppContext.  
    * **Failure Handling:** User does *not* click "Mark Complete" on failure. They manually update filament on Page 1\.  
  * **Notifications:** Browser notifications.

### **Page 4: Settings**

* **Component:** pages/Settings.jsx.  
* **State:** Uses data from AppContext.  
* **Purpose:** Configure app components and manage data.  
* **UI:**  
  * **Printer Management:** List of printers. "Add Printer" modal.  
    * **Add Printer Form:** Name, Bed Size X, Bed Size Y, Has AMS.  
  * **Intervention Times:** List of intervention times.  
    * **Add Intervention Time Form:** Name, Time (24-hr), Days (checkboxes).  
  * **Data Management:** "Export Current Data" button.  
* **Functionality:**  
  * **Export Data:** Calls exportData from useFileHandler.js hook.

## **3\. Data Structure (In-Memory & JSON Export)**

The exported JSON file and in-memory state (managed by AppContext.jsx) will have a single root object containing:

{  
  "printers": \[  
    { ... }  
  \],  
  "filaments": \[  
    { ... }  
  \],  
  "printQueue": \[  
    { ... }  
  \],  
  "interventionTimes": \[  
    { ... }  
  \],  
  "dropdownOptions": {  
    "brands": \["Overture", "Sunlu", "Hatchbox", ...\],  
    "types": \["PLA", "PETG", "ABS", "TPU", ...\],  
    "colors": \["Black", "White", "Space Gray", "Red", ...\],  
    "urgencies": \["Low", "Medium", "High", ...\]  
  }  
}

### **printers array**

Each object in the "printers" array:

{  
  "id": "printer\_123",  
  "name": "Ender 3 Pro",  
  "status": "Idle", // "Idle", "Printing", "Maintenance"  
  "bedSizeX": 220,  
  "bedSizeY": 220,  
  "hasAMS": false  
}

### **filaments array**

Each object in the "filaments" array:

{  
  "id": "fila\_abc",  
  "brand": "Overture",  
  "type": "PLA",  
  "color": "Space Gray",  
  "colorHex": "\#5a5a5a", // (Optional, for UI colors)  
  "initialFilamentWeight\_g": 1000,  
  "emptySpoolWeight\_g": 215,  
  "remaining\_g": 1000 // Last calculated remainder. Defaults to \`initialFilamentWeight\_g\`  
}

### **printQueue array**

Each object in the "printQueue" array:

{  
  "id": "job\_456",  
  "name": "Benchy",  
  "url": "\[https://www.thingiverse.com/thing:763622\](https://www.thingiverse.com/thing:763622)",  
  "printTime\_hr": 1.5,  
  "filamentUsage\_g": 15,  
  "requiredType": "PLA",  
  "requiredColor": "Red",  
  "urgency": "Medium",  
  "status": "Queued", // "Queued", "Scheduled", "Printing", "Completed", "Failed"

  // Printer Constraints  
  "printSizeX": 40,  
  "printSizeY": 31,  
  "amsRequired": false,  
  "compatiblePrinterIds": \[\], // Empty array means "Any". \["printer\_123"\] means only that one.

  // Fields filled in by the Scheduler:  
  "assignedPrinterId": "printer\_123",  
  "assignedFilamentId": "fila\_xyz",  
  "buffer\_hr": 0.25,  
  "startTime": "2025-10-24T18:00:00Z",  
  "endTime": "2025-10-24T19:45:00Z"  
}

### **interventionTimes array**

Each object in the "interventionTimes" array:

{  
  "id": "time\_1",  
  "name": "Lunch",  
  "time": "12:00", // 24-hour format  
  "days": \[1, 2, 3, 4, 5\] // 0=Sun, 1=Mon, 2=Tue...  
}  
