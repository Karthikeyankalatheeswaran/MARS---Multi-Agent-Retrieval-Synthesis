from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " "]
    )

    # IMPORTANT: returns List[Document]
    chunks = splitter.split_documents(documents)
    return chunks
