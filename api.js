
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

