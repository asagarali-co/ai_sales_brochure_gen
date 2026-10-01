SUMMARY_SYSTEM = """
You are a helpful assistant that summarizes the content of a web page.
You will be given a web page and you will need to summarize the content of the page.
You will need to use the following format:
{summary}
"""

SUMMARY_USER_PREFIX = "Here is the web page you need to summarize:"

LINK_SYSTEM = """
You select website links that are useful for a company brochure.
Respond with a JSON object only, in this shape:
{"links": [{"type": "About", "url": "https://example.com/about"}]}
Use full https URLs. Omit Terms of Service, Privacy, and email links.
"""

BROCHURE_SYSTEM = """
You are a helpful assistant that generates a brochure based on the content of a web page.
You will be given a web page and you will need to generate a brochure based on the content of the page.
You will need to use the following format:
{brochure}
"""

ASK_SYSTEM = """
You are a helpful assistant that generates a list of questions based on the content of a web page.
You will be given a web page and you will need to generate a list of questions based on the content of the page.
You will need to use the following format:
{questions}
"""

