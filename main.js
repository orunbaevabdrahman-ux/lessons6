const API = "https://6b08353258419b87a439580e.mockapi.io/books.mockapi.io/books";

async function request(url, method = "GET", body) {

    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = new Error(`Ошибка сервера: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return response.json();
}
export const getBooks = (query = "") =>
    request(`${API}${query ? `?${query}` : ""}`);


export const createBook = (book) =>
    request(API, "POST", book);

export const updateBook = (id, book) =>
    request(`${API}/${id}`, "PUT", book);

export const deleteBook = (id) =>
    request(`${API}/${id}`, "DELETE");

import {
    getBooks,
    createBook,
    updateBook,
    deleteBook
} from "./api.js";

const booksList = document.querySelector("#booksList");
const bookForm = document.querySelector("#bookForm");
const message = document.querySelector("#message");
const loadMoreBtn = document.querySelector("#loadMore");

const searchInput = document.querySelector("#search");
const readFilter = document.querySelector("#readFilter");
const sortBy = document.querySelector("#sortBy");
const order = document.querySelector("#order");

const LIMIT = 5;

let currentPage = 1;
let displayedBooks = [];
let hasMore = true;


function renderBooks(books) {
    booksList.innerHTML = "";

    books.forEach((book) => {
        const card = document.createElement("div");
        card.classList.add("book-card");

        const title = document.createElement("h3");
        title.textContent = book.title;

        const author = document.createElement("p");
        author.textContent = `Автор: ${book.author}`;

        const year = document.createElement("p");
        year.textContent = `Год: ${book.year}`;

        const status = document.createElement("p");
        status.textContent = book.isRead
            ? " Прочитана"
            : " Не прочитана";

        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = book.isRead
            ? "Отметить непрочитанной"
            : "Отметить прочитанной";
        toggleBtn.classList.add("toggle-btn");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Удалить";
        deleteBtn.classList.add("delete-btn");

        card.dataset.id = book.id;

        card.append(
            title,
            author,
            year,
            status,
            toggleBtn,
            deleteBtn
        );

        booksList.append(card);
    });
}


async function getAllBooks() {
    currentPage = 1;
    displayedBooks = [];
    hasMore = true;

    await loadBooks(true);
}

async function loadBooks(reset = false) {
    if (!hasMore && !reset) return;

    const page = reset ? 1 : currentPage + 1;

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", LIMIT);

    if (readFilter.value !== "") {
        params.append("isRead", readFilter.value);
    }

    if (searchInput.value.trim() !== "") {
        params.append("search", searchInput.value.trim());
    }

    params.append("sortBy", sortBy.value);
    params.append("order", order.value);

    try {
        message.textContent = "Загрузка...";

        const books = await getBooks(params.toString());

        if (reset) {
            displayedBooks = [];
        }

        displayedBooks.push(...books);

        currentPage = page;

        renderBooks(displayedBooks);

        message.textContent = displayedBooks.length
            ? ""
            : "Ничего не найдено";

        hasMore = books.length === LIMIT;

        loadMoreBtn.style.display = hasMore
            ? "block"
            : "none";

    } catch (error) {

        if (error.status === 404) {

            if (page === 1) {
                displayedBooks = [];
                renderBooks(displayedBooks);
                message.textContent = "Ничего не найдено";
            }

            hasMore = false;
            loadMoreBtn.style.display = "none";

        } else {
            console.error(error);
            message.textContent = "Ошибка загрузки книг";
        }
    }
}


bookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(
        new FormData(bookForm)
    );

    console.log("Данные формы:", data);

    data.year = Number(data.year);

    data.isRead = bookForm.elements.isRead.checked;

    try {
        await createBook(data);

        bookForm.reset();

        await getAllBooks();

        console.log("Книга успешно добавлена!");

    } catch (error) {
        console.error("Ошибка добавления:", error);
        message.textContent = "Не удалось добавить книгу";
    }
});


searchInput.addEventListener("input", () => {
    getAllBooks();
});

readFilter.addEventListener("change", () => {
    getAllBooks();
});

sortBy.addEventListener("change", () => {
    getAllBooks();
});

order.addEventListener("change", () => {
    getAllBooks();
});

loadMoreBtn.addEventListener("click", () => {
    loadBooks();
});

booksList.addEventListener("click", async (event) => {

    const card = event.target.closest(".book-card");

    if (!card) return;

    const id = card.dataset.id;

    const book = displayedBooks.find(
        (item) => String(item.id) === String(id)
    );

    if (!book) return;

    if (event.target.classList.contains("delete-btn")) {

        try {
            await deleteBook(id);

            displayedBooks = displayedBooks.filter(
                (item) => String(item.id) !== String(id)
            );

            renderBooks(displayedBooks);

            if (displayedBooks.length === 0) {
                message.textContent = "Ничего не найдено";
            }

        } catch (error) {
            console.error("Ошибка удаления:", error);
            message.textContent = "Не удалось удалить книгу";
        }
    }

    if (event.target.classList.contains("toggle-btn")) {

        try {
            const updatedBook = await updateBook(id, {
                ...book,
                isRead: !book.isRead
            });

            displayedBooks = displayedBooks.map((item) =>
                String(item.id) === String(id)
                    ? updatedBook
                    : item
            );

            renderBooks(displayedBooks);

        } catch (error) {
            console.error("Ошибка обновления:", error);
            message.textContent = "Не удалось изменить статус";
        }
    }
});
try {
    const response = await fetch(
        "https://6b08353258419b87a439580e.mockapi.io/books.mockapi.io/books",
        {
            method: "DELETE"
        }
    );

} catch (error) {
    console.log(error);
}

getAllBooks();
