import DataURIParser from "datauri/parser.js";
import path from "path";


export const getBuffer = (file) => {
    const parser = new DataURIParser()
    const ext = path.extname(file.originalname).toString()
    return parser.format(ext,file.buffer)
}