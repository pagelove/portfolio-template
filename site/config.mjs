export const config={
  "id": "portfolio",
  "repo": "portfolio-template",
  "title": "Alex Morgan",
  "heading": "Ideas made tangible.",
  "intro": "A fictional designer’s collection of interfaces, systems and carefully considered details.",
  "noun": "project",
  "plural": "projects",
  "titleField": "title",
  "publishing": true,
  "fields": [
    {
      "key": "title",
      "label": "Project",
      "type": "text",
      "required": true
    },
    {
      "key": "category",
      "label": "Discipline",
      "type": "text",
      "required": true
    },
    {
      "key": "description",
      "label": "Project story",
      "type": "textarea",
      "required": true
    },
    {
      "key": "image",
      "label": "Image URL",
      "type": "image",
      "required": false,
      "max": 350000
    },
    {
      "key": "alt",
      "label": "Image description",
      "type": "text",
      "required": false
    },
    {
      "key": "link",
      "label": "Project URL",
      "type": "url",
      "required": false
    },
    {
      "key": "state",
      "label": "Publication state",
      "type": "select",
      "required": true,
      "options": [
        "Draft",
        "Published"
      ],
      "default": "Draft"
    }
  ],
  "settings": [
    {
      "key": "name",
      "label": "Your name",
      "default": "Alex Morgan",
      "type": "text",
      "required": true
    },
    {
      "key": "headline",
      "label": "Headline",
      "default": "Selected work. Thoughtfully made.",
      "type": "text",
      "required": true
    },
    {
      "key": "about",
      "label": "About you",
      "default": "An independent designer working across identity, spaces and digital products.",
      "type": "textarea",
      "required": true
    },
    {
      "key": "skills",
      "label": "Skills",
      "default": "Art direction, identity, interface design",
      "type": "text",
      "required": true
    },
    {
      "key": "contact",
      "label": "Contact email",
      "default": "alex@example.com",
      "type": "text",
      "required": true
    }
  ]
};
