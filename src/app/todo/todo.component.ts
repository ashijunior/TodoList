import { Component, OnInit } from '@angular/core';
import { TodoServiceService } from '../Service/todo-service.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";


@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
  providers: [DatePipe],
  standalone: false
})
export class TodoComponent implements OnInit{
  listType: any;
  listTypeInput: any;
  //For Search
  filteredRows: any;
  searchText: string = '';
  //For Pagination
  itemsPerPage: number = 10;
  p = 1;
  //Variables for Create modal
  createListId: number | null = null;
  createListName: string = '';
  createListEndDate: string = '';
  createListStartDate: string = '';
  iscreateModalVisible: boolean = false;
// Variables for modal
editListId: number | null = null;
editListName: string = '';
editListStartDate: string = '';
editListEndDate: string = '';
isEditModalVisible: boolean = false;
//start date
today: string= '';
// end date
endDateMin: string = '';
infoMessage: string = '';

  constructor(private auth: TodoServiceService) {}

ngOnInit(): void {
  // Generate User ID
  if (typeof window !== 'undefined' && window.localStorage) {
    // Safe to use localStorage
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      const newUserId = this.generateUserId(); // Implement your ID generator
      localStorage.setItem('userId', newUserId);
    }
  }
  // Fetch the LIst of Tasks
  this.fetchTodoList();

    // Generate today's date in the required format (YYYY-MM-DD)
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    // For end date
    this.endDateMin = this.today;
}

// Code for User Id
generateUserId(): string {
  // Create a unique user ID using the current timestamp and a random number
  return 'user-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

// Code to update the minimum value for the end date based on the selected start date
onStartDateChange(): void {
  // Update the minimum value for the end date based on the selected start date
  if (this.createListStartDate) {
    this.endDateMin = this.createListStartDate;
  } else {
    this.endDateMin = this.today; // Reset to today if start date is cleared
  }
}
onEndDateChange(): void {
  // Check if the selected end date is before the start date
  if (this.createListEndDate && this.createListStartDate) {
    const startDate = new Date(this.createListStartDate);
    const endDate = new Date(this.createListEndDate);

    if (endDate < startDate) {
      this.infoMessage = 'End Date cannot be earlier than Start Date.';
    } else {
      this.infoMessage = ''; // Clear message if the date is valid
    }
  }
}

// Fetch all Todo List items
fetchTodoList(): void {
  this.auth.getTodoList()
    .subscribe({
      next: (listTypeResponse: any[]) => {
        console.log('Todo-List fetched successfully:', listTypeResponse);
        this.listType = listTypeResponse;
        this.filteredRows = listTypeResponse;
        this.applyFilter();
      },
      error: err => {
        console.error('Error fetching Todo-List:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch Todo-List!',
        });
      }
    });
}

// Create Todo List
addTodoList(listType: string): void {
  if (listType && listType.trim() !== "") {
    this.auth.createTodoList({ name: listType.trim() })
      .subscribe({
        next: (listTypeResponse: any) => {
          console.log('Task added! You are one step closer to greatness.:', listTypeResponse);
          this.fetchTodoList();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Task added! You are one step closer to greatness.',
          });
        },
        error: (err: any) => {
          console.error('Oops! Task not added. Give it another shot!:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Oops! Task not added. Give it another shot!',
          });
        }
      });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please inut Task properly!',
    });
  }
}

// Update an item in the Todo List
editTodoList(id: number, updatedTask: any): void {
  this.auth.updateTodoList(id, updatedTask)
    .subscribe({
      next: (updatedProductType: any) => {
        console.log('Task revamped! It’s looking even better now:', updatedProductType);
        this.fetchTodoList();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Task revamped! It’s looking even better now.',
        });
        this.closeEditModal(); // Close modal on success
      },
      error: (err: any) => {
        console.error('Bummer! An error occurred. Let us give it another shot!:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Bummer! An error occurred. Let us give it another shot!',
        });
      }
    });
}


// Delete an item in the Todod List
deleteTask(id: number): void {
  this.auth.deleteTodoList(id)
    .subscribe({
      next: (response: any) => {
        console.log('Poof! Task gone. Like it was never there.');
        this.fetchTodoList();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Poof! Task gone. Like it was never there. ',
        });
      },
      error: (err: any) => {
        console.error('Error deleting Task:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete Task!',
        });
      }
    });
}

// For IsCompleted
onStatusChange(todo: any): void {
  console.log('Task completed status:', todo.isCompleted);

  // Call the backend to update the task
  this.auth.updateIsCompleted(todo.id, todo.isCompleted)
    .subscribe({
      next: (updatedTask) => {
        console.log('Task status updated successfully:', updatedTask);
        // Optionally show a success message (e.g., using SweetAlert)
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Task status updated!',
        });
      },
      error: (err) => {
        console.error('Error updating task status:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error updating task status!',
        });
      }
    });
}


// For search
applyFilter(): void {
  if (this.searchText.trim().length === 0) {
    this.filteredRows = this.listType; // Reset to the original list when search text is empty
  } else {
    this.filteredRows = this.listType.filter((type: any) =>
      type.taskName.toLowerCase().includes(this.searchText.toLowerCase()) // Filter by task name
    );
  }
}

// For Create Task modal
openCreateModal(): void {
  this.iscreateModalVisible = true;  // Show modal
  this.createListName = '';  // Clear the form fields
  this.createListStartDate = '';
  this.createListEndDate = '';
}

closeCreateModal(): void {
  this.iscreateModalVisible = false;  // Hide modal
  this.resetCreateForm();
}

saveCreate(): void {
  if (this.createListName.trim() !== '') {
    const newTask = {
      taskName: this.createListName,
      startDate: this.createListStartDate,
      endDate: this.createListEndDate,
    };

    // Call the service method to create a new task
    this.auth.createTodoList(newTask).subscribe({
      next: (response: any) => {
        console.log('Task created successfully:', response);
        this.fetchTodoList();  // Fetch the updated list of tasks
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Victory! Your task is locked and loaded!',
        });
        this.resetCreateForm(); // Clear the input fields after successful creation
      },
      error: (err: any) => {
        console.error('Task creation failed:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Task creation failed. Please try again.',
        });
      }
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please provide a task name.',
    });
  }
}

  // Helper to reset the Create Task form
  resetCreateForm(): void {
    this.createListName = '';
    this.createListStartDate = '';
    this.createListEndDate = '';
  }


// For Edit modal
openEditModal(todos: any): void {
  this.isEditModalVisible = true; // Show modal
  this.editListId = todos.id;
  this.editListName = todos.taskName;
  this.editListStartDate = todos.startDate ? this.formatDate(todos.startDate) : ''; // Ensure correct date format
  this.editListEndDate = todos.endDate ? this.formatDate(todos.endDate) : ''; // Ensure correct date format
}

closeEditModal(): void {
  this.isEditModalVisible = false; // Hide modal
  this.resetEditForm();
}

saveEdit(): void {
  if (this.editListId !== null) {
    const updatedTask = {
      id: this.editListId,
      taskName: this.editListName,
      startDate: this.editListStartDate,
      endDate: this.editListEndDate,
    };

    this.editTodoList(this.editListId, updatedTask);  // Send updated task
  }
}

// Helper to format date if necessary (e.g., for consistent date format)
formatDate(date: any): string {
  const formattedDate = new Date(date);
  return formattedDate.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
}
// Reset form data
resetEditForm(): void {
  this.editListId = null;
  this.editListName = '';
  this.editListStartDate = '';
  this.editListEndDate = '';
}



}
