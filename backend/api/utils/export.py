import re
import html
from typing import List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from datetime import datetime


def markdown_to_reportlab(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    return text


def export_answer_to_pdf(
    filepath: str,
    question: str,
    answer: str,
    sources: Optional[List] = None
):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        leftMargin=1*inch,
        rightMargin=1*inch
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Heading1'],
        fontSize=18, textColor='#2C3E50',
        spaceAfter=20, alignment=TA_CENTER
    )

    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading2'],
        fontSize=14, textColor='#34495E',
        spaceAfter=12, spaceBefore=12
    )

    body_style = ParagraphStyle(
        'CustomBody', parent=styles['BodyText'],
        fontSize=11, leading=16,
        spaceAfter=10, alignment=TA_LEFT
    )

    source_style = ParagraphStyle(
        'SourceStyle', parent=styles['BodyText'],
        fontSize=9, leading=12,
        leftIndent=20, textColor='#7F8C8D'
    )

    story = []

    story.append(Paragraph("MARS - Study Assistant", title_style))
    story.append(Spacer(1, 0.3*inch))

    date_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    story.append(Paragraph(f"<i>Generated on {date_str}</i>", source_style))
    story.append(Spacer(1, 0.4*inch))

    story.append(Paragraph("Question", heading_style))
    story.append(Paragraph(markdown_to_reportlab(question), body_style))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("Answer", heading_style))

    answer_paragraphs = answer.split('\n\n')
    for para in answer_paragraphs:
        if para.strip():
            formatted_para = markdown_to_reportlab(para.strip())
            try:
                story.append(Paragraph(formatted_para, body_style))
                story.append(Spacer(1, 0.1*inch))
            except Exception:
                clean_text = html.escape(para.strip()).replace('*', '')
                story.append(Paragraph(clean_text, body_style))

    if sources:
        story.append(PageBreak())
        story.append(Paragraph("Sources & Evidence", heading_style))
        story.append(Spacer(1, 0.2*inch))

        for i, src in enumerate(sources[:5], 1):
            source_header = f"<b>Source {i}</b>"
            if hasattr(src, 'page') and src.page:
                source_header += f" (Page {src.page})"

            story.append(Paragraph(source_header, body_style))

            if hasattr(src, 'content'):
                content = src.content[:600] + "..." if len(src.content) > 600 else src.content
                story.append(Paragraph(html.escape(content), source_style))
            story.append(Spacer(1, 0.2*inch))

    try:
        doc.build(story)
        print(f"[Export] PDF created: {filepath}")
        return True
    except Exception as e:
        print(f"[Export] Critical error building PDF: {e}")
        return False
